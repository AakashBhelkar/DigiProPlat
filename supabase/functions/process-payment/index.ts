import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { productId, amount } = await req.json()

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Here you would integrate with Stripe or your payment processor
    // For now, we'll simulate a successful payment
    
    // Create transaction record
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        product_id: productId,
        type: 'sale',
        amount: amount,
        status: 'completed',
        payment_method: 'stripe',
        description: `Sale of product ${productId}`,
        user_id: 'customer-user-id' // This would come from the authenticated user
      })
      .select()
      .single()

    if (transactionError) {
      throw transactionError
    }

    // Update product sales count and revenue
    const { error: productError } = await supabaseClient
      .from('products')
      .update({
        sales_count: supabaseClient.raw('sales_count + 1'),
        total_revenue: supabaseClient.raw(`total_revenue + ${amount}`)
      })
      .eq('id', productId)

    if (productError) {
      throw productError
    }

    // Send notification email to seller
    // This would call your email service

    return new Response(
      JSON.stringify({ 
        success: true, 
        transactionId: transaction.id,
        message: 'Payment processed successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
});