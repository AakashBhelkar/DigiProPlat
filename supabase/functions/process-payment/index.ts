import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Invalid authentication');
    }

    const { paymentIntentId, productId, amount, buyerId, sellerId } = await req.json();

    // Validate input
    if (!paymentIntentId) {
      throw new Error('Payment intent ID is required');
    }

    if (!productId) {
      throw new Error('Product ID is required');
    }

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      throw new Error('Payment intent not found');
    }

    // Check payment intent status
    if (paymentIntent.status === 'succeeded') {
      // Payment already succeeded - check if transaction already exists
      const { data: existingTransaction } = await supabase
        .from('transactions')
        .select('id')
        .eq('stripe_payment_id', paymentIntentId)
        .single();

      if (existingTransaction) {
        return new Response(
          JSON.stringify({
            success: true,
            transactionId: existingTransaction.id,
            message: 'Payment already processed',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
    } else if (paymentIntent.status === 'requires_payment_method') {
      throw new Error('Payment requires a payment method');
    } else if (paymentIntent.status === 'requires_confirmation') {
      // Confirm the payment intent
      const confirmedIntent = await stripe.paymentIntents.confirm(paymentIntentId);
      
      if (confirmedIntent.status !== 'succeeded') {
        throw new Error(`Payment confirmation failed. Status: ${confirmedIntent.status}`);
      }
    } else if (paymentIntent.status === 'canceled' || paymentIntent.status === 'payment_failed') {
      throw new Error(`Payment failed. Status: ${paymentIntent.status}`);
    } else if (paymentIntent.status !== 'succeeded') {
      throw new Error(`Payment not completed. Status: ${paymentIntent.status}`);
    }

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, user_id, title, price')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      throw new Error('Product not found');
    }

    // Verify amount matches
    const expectedAmount = Math.round(Number(amount) * 100); // Convert to cents
    if (paymentIntent.amount !== expectedAmount) {
      throw new Error('Payment amount mismatch');
    }

    // Get seller ID from product or request
    const finalSellerId = sellerId || product.user_id;
    const finalBuyerId = buyerId || user.id;

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: finalBuyerId,
        product_id: productId,
        type: 'sale',
        amount: Number(amount),
        status: 'completed',
        payment_method: 'stripe',
        stripe_payment_id: paymentIntentId,
        description: `Sale of ${product.title}`,
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      throw new Error(`Failed to create transaction: ${transactionError.message}`);
    }

    // Create order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        product_id: productId,
        buyer_id: finalBuyerId,
        seller_id: finalSellerId,
        total_amount: Number(amount),
        status: 'completed',
        payment_method: 'stripe',
        payment_intent_id: paymentIntentId,
        customer_email: user.email || '',
        customer_name: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || user.email || 'Customer',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      // Continue even if order creation fails - transaction is already recorded
    }

    // Update product sales count and revenue using RPC function
    try {
      // Try RPC function first (if it exists)
      const { error: rpcError } = await supabase.rpc('increment_product_sales', {
        p_product_id: productId,
        p_amount: Number(amount),
      });

      if (rpcError) {
        // Fallback: Fetch current values and update
        console.warn('RPC function not available, using fetch-and-update approach');
        const { data: currentProduct, error: fetchError } = await supabase
          .from('products')
          .select('sales_count, total_revenue')
          .eq('id', productId)
          .single();

        if (!fetchError && currentProduct) {
          const { error: updateError } = await supabase
            .from('products')
            .update({
              sales_count: (currentProduct.sales_count || 0) + 1,
              total_revenue: (Number(currentProduct.total_revenue) || 0) + Number(amount),
            })
            .eq('id', productId);

          if (updateError) {
            console.error('Error updating product:', updateError);
            // Continue even if product update fails
          }
        } else {
          console.error('Error fetching product for update:', fetchError);
        }
      }
    } catch (error) {
      console.error('Error updating product sales:', error);
      // Continue even if product update fails
    }

    // Update seller wallet balance using RPC function
    if (finalSellerId) {
      try {
        // Try RPC function first (if it exists)
        const { error: rpcError } = await supabase.rpc('add_to_wallet', {
          p_user_id: finalSellerId,
          p_amount: Number(amount) * 0.9, // 90% to seller, 10% platform fee
        });

        if (rpcError) {
          // Fallback: Fetch current balance and update
          console.warn('RPC function not available, using fetch-and-update approach');
          const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('wallet_balance')
            .eq('id', finalSellerId)
            .single();

          if (!fetchError && profile) {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                wallet_balance: (Number(profile.wallet_balance) || 0) + (Number(amount) * 0.9),
              })
              .eq('id', finalSellerId);

            if (updateError) {
              console.error('Error updating wallet:', updateError);
              // Continue even if wallet update fails
            }
          } else {
            console.error('Error fetching profile for wallet update:', fetchError);
          }
        }
      } catch (error) {
        console.error('Error updating wallet:', error);
        // Continue even if wallet update fails
      }
    }

    // Send notification email to seller (optional - can be done via webhook)
    // This is handled by the stripe-webhook function, so we don't duplicate it here

    return new Response(
      JSON.stringify({
        success: true,
        transactionId: transaction.id,
        orderId: order?.id,
        paymentIntentId: paymentIntentId,
        message: 'Payment processed successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error processing payment:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to process payment',
        success: false,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
