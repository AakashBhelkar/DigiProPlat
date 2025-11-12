import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Generate a secure random token
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderId, expiresInDays = 7, maxDownloads = 5 } = await req.json();

    if (!orderId) {
      throw new Error('Missing required field: orderId');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify order exists and get product_id
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, product_id, buyer_id, status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'completed') {
      throw new Error('Order is not completed');
    }

    // Get all product files for this order's product
    const { data: productFiles, error: filesError } = await supabase
      .from('product_files')
      .select('id, name, storage_path, file_type')
      .eq('product_id', order.product_id);

    if (filesError) {
      throw new Error('Failed to fetch product files');
    }

    if (!productFiles || productFiles.length === 0) {
      throw new Error('No files found for this product');
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const downloadLinks: Array<{
      fileId: string;
      fileName: string;
      downloadUrl: string;
      expiresAt: string;
      downloadCount: number;
      maxDownloads: number;
    }> = [];

    // Generate download tokens and signed URLs for each file
    for (const file of productFiles) {
      // Check if token already exists for this order+file combination
      const { data: existingToken } = await supabase
        .from('download_tokens')
        .select('*')
        .eq('order_id', orderId)
        .eq('file_id', file.id)
        .single();

      let token: string;
      let tokenId: string;

      if (existingToken) {
        // Use existing token if it hasn't expired and hasn't exceeded max downloads
        if (
          new Date(existingToken.expires_at) > new Date() &&
          existingToken.download_count < existingToken.max_downloads
        ) {
          token = existingToken.token;
          tokenId = existingToken.id;
        } else {
          // Generate new token if old one expired or exceeded downloads
          token = generateToken();
          const { data: newToken, error: tokenError } = await supabase
            .from('download_tokens')
            .upsert({
              id: existingToken.id,
              order_id: orderId,
              file_id: file.id,
              token,
              expires_at: expiresAt.toISOString(),
              download_count: 0,
              max_downloads: maxDownloads,
            })
            .select()
            .single();

          if (tokenError) {
            throw new Error('Failed to create download token');
          }
          tokenId = newToken.id;
        }
      } else {
        // Create new token
        token = generateToken();
        const { data: newToken, error: tokenError } = await supabase
          .from('download_tokens')
          .insert({
            order_id: orderId,
            file_id: file.id,
            token,
            expires_at: expiresAt.toISOString(),
            download_count: 0,
            max_downloads: maxDownloads,
          })
          .select()
          .single();

        if (tokenError) {
          throw new Error('Failed to create download token');
        }
        tokenId = newToken.id;
      }

      // Generate signed URL from Supabase Storage
      // Extract bucket and path from storage_path
      // storage_path format: "product-files/product-id/filename.ext"
      const storagePath = file.storage_path;
      const bucket = 'product-files'; // Default bucket name
      
      // Generate signed URL (expires in same time as token)
      const { data: signedUrlData, error: signedUrlError } = await supabase
        .storage
        .from(bucket)
        .createSignedUrl(storagePath, expiresInDays * 24 * 60 * 60); // Convert days to seconds

      if (signedUrlError) {
        console.error('Error generating signed URL:', signedUrlError);
        // Fallback: use token-based download endpoint
        const baseUrl = Deno.env.get('SITE_URL') || 'https://digiproplat.com';
        const downloadUrl = `${baseUrl}/api/download/${token}`;
        
        downloadLinks.push({
          fileId: file.id,
          fileName: file.name,
          downloadUrl,
          expiresAt: expiresAt.toISOString(),
          downloadCount: existingToken?.download_count || 0,
          maxDownloads,
        });
      } else {
        downloadLinks.push({
          fileId: file.id,
          fileName: file.name,
          downloadUrl: signedUrlData.signedUrl,
          expiresAt: expiresAt.toISOString(),
          downloadCount: existingToken?.download_count || 0,
          maxDownloads,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        downloadLinks,
        expiresAt: expiresAt.toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error generating download links:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate download links' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

