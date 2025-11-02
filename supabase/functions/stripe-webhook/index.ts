import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!signature || !webhookSecret) {
    return new Response('Missing signature or webhook secret', { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Webhook event received:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log('Processing checkout session:', session.id);

        // Create order in database
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            product_id: session.metadata?.productId,
            buyer_id: session.client_reference_id || session.metadata?.buyerId,
            amount: (session.amount_total! / 100),
            status: 'completed',
            stripe_session_id: session.id,
            payment_intent_id: session.payment_intent as string,
          })
          .select()
          .single();

        if (orderError) {
          console.error('Error creating order:', orderError);
          throw orderError;
        }

        console.log('Order created:', order.id);

        // Update product sales count and revenue
        const { error: productError } = await supabase.rpc('increment_product_sales', {
          p_product_id: session.metadata?.productId,
          p_amount: (session.amount_total! / 100),
        });

        if (productError) {
          console.error('Error updating product stats:', productError);
        }

        // Update seller wallet balance
        const { error: walletError } = await supabase.rpc('add_to_wallet', {
          p_user_id: session.metadata?.sellerId,
          p_amount: (session.amount_total! / 100) * 0.9, // 90% to seller, 10% platform fee
        });

        if (walletError) {
          console.error('Error updating wallet:', walletError);
        }

        // TODO: Send email notification with download links
        console.log('Payment successful for product:', session.metadata?.productId);

        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent succeeded:', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent failed:', paymentIntent.id);

        // Create a failed order record
        const { error } = await supabase.from('orders').insert({
          product_id: paymentIntent.metadata?.productId,
          buyer_id: paymentIntent.metadata?.buyerId,
          amount: (paymentIntent.amount / 100),
          status: 'failed',
          payment_intent_id: paymentIntent.id,
        });

        if (error) {
          console.error('Error creating failed order record:', error);
        }

        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        console.log('Charge refunded:', charge.id);

        // Update order status to refunded
        const { error } = await supabase
          .from('orders')
          .update({ status: 'refunded' })
          .eq('payment_intent_id', charge.payment_intent);

        if (error) {
          console.error('Error updating order to refunded:', error);
        }

        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Webhook error:', error.message);
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }
});
