import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { token, fileId } = await req.json();

    if (!token || !fileId) {
      throw new Error('Missing required fields: token and fileId');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find download token
    const { data: downloadToken, error: tokenError } = await supabase
      .from('download_tokens')
      .select('*, product_files(storage_path)')
      .eq('token', token)
      .eq('file_id', fileId)
      .single();

    if (tokenError || !downloadToken) {
      throw new Error('Invalid download token');
    }

    // Check if token is expired
    if (new Date(downloadToken.expires_at) < new Date()) {
      throw new Error('Download link has expired');
    }

    // Check if download limit exceeded
    if (downloadToken.download_count >= downloadToken.max_downloads) {
      throw new Error('Download limit exceeded');
    }

    // Increment download count
    const { error: updateError } = await supabase
      .from('download_tokens')
      .update({
        download_count: downloadToken.download_count + 1,
      })
      .eq('id', downloadToken.id);

    if (updateError) {
      throw new Error('Failed to track download');
    }

    // Also increment download count on product_file
    const { error: fileUpdateError } = await supabase.rpc('increment', {
      table_name: 'product_files',
      column_name: 'download_count',
      id: fileId,
    });

    if (fileUpdateError) {
      // Non-critical error, just log it
      console.error('Failed to update file download count:', fileUpdateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        downloadCount: downloadToken.download_count + 1,
        maxDownloads: downloadToken.max_downloads,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error tracking download:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to track download' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

