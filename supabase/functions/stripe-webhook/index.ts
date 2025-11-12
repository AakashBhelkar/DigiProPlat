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

        // Get buyer and seller IDs
        const buyerId = session.client_reference_id || session.metadata?.buyerId;
        const sellerId = session.metadata?.sellerId;
        const productId = session.metadata?.productId;
        const amount = session.amount_total! / 100;

        // Fetch product details to get price
        const { data: product, error: productFetchError } = await supabase
          .from('products')
          .select('id, title, price, user_id')
          .eq('id', productId)
          .single();

        if (productFetchError || !product) {
          console.error('Error fetching product:', productFetchError);
          throw new Error('Product not found');
        }

        // Create order in database with correct structure
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            customer_id: buyerId,
            seller_id: sellerId || product.user_id,
            customer_email: session.customer_email || session.customer_details?.email || '',
            customer_name: session.customer_details?.name || '',
            total_amount: amount,
            currency: session.currency?.toUpperCase() || 'USD',
            status: 'completed',
            payment_method: 'stripe',
            payment_intent_id: session.payment_intent as string,
            completed_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (orderError) {
          console.error('Error creating order:', orderError);
          throw orderError;
        }

        console.log('Order created:', order.id);

        // Create order item
        const { error: orderItemError } = await supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            product_id: productId,
            quantity: 1,
            unit_price: product.price || amount,
            total_price: amount,
          });

        if (orderItemError) {
          console.error('Error creating order item:', orderItemError);
          // Don't throw - order is already created
        }

        // Update product sales count and revenue
        const { error: productError } = await supabase.rpc('increment_product_sales', {
          p_product_id: productId,
          p_amount: amount,
        });

        if (productError) {
          console.error('Error updating product stats:', productError);
        }

        // Update seller wallet balance
        const finalSellerId = sellerId || product.user_id;
        const { error: walletError } = await supabase.rpc('add_to_wallet', {
          p_user_id: finalSellerId,
          p_amount: amount * 0.9, // 90% to seller, 10% platform fee
        });

        if (walletError) {
          console.error('Error updating wallet:', walletError);
        }

        // Product details already fetched above

        // Fetch buyer email
        let buyerEmail = session.customer_email;
        let buyerName = 'Customer';
        if (buyerId && !buyerEmail) {
          const { data: buyerProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', buyerId)
            .single();
          
          if (buyerProfile) {
            const { data: authUser } = await supabase.auth.admin.getUserById(buyerId);
            if (authUser?.user?.email) {
              buyerEmail = authUser.user.email;
              buyerName = authUser.user.user_metadata?.full_name || authUser.user.email.split('@')[0];
            }
          }
        }

        // Fetch seller email
        let sellerEmail = '';
        let sellerName = 'Seller';
        if (sellerId) {
          const { data: sellerProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', sellerId)
            .single();
          
          if (sellerProfile) {
            const { data: authUser } = await supabase.auth.admin.getUserById(sellerId);
            if (authUser?.user?.email) {
              sellerEmail = authUser.user.email;
              sellerName = authUser.user.user_metadata?.full_name || authUser.user.email.split('@')[0];
            }
          }
        }

        // Generate download links
        let downloadLinks: string[] = [];
        try {
          const downloadResponse = await fetch(`${supabaseUrl}/functions/v1/generate-download-links`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              orderId: order.id,
              expiresInDays: 7,
              maxDownloads: 5,
            }),
          });

          if (downloadResponse.ok) {
            const downloadData = await downloadResponse.json();
            downloadLinks = downloadData.downloadLinks?.map((link: any) => link.downloadUrl) || [];
          } else {
            console.error('Failed to generate download links, will send email without links');
          }
        } catch (downloadError) {
          console.error('Error generating download links:', downloadError);
          // Continue without download links - they can be generated later
        }

        // Send order confirmation email to buyer
        if (buyerEmail) {
          try {
            const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-notification-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({
                to: buyerEmail,
                subject: `Order Confirmation - ${product?.title || 'Your Purchase'}`,
                type: 'order_confirmation',
                data: {
                  productName: product?.title || 'Product',
                  orderId: order.id,
                  amount,
                  downloadLinks,
                },
              }),
            });

            if (!emailResponse.ok) {
              console.error('Failed to send order confirmation email');
            }
          } catch (emailError) {
            console.error('Error sending order confirmation email:', emailError);
          }
        }

        // Send sale notification email to seller
        if (sellerEmail && product) {
          try {
            const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-notification-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({
                to: sellerEmail,
                subject: `New Sale: ${product.title}`,
                type: 'sale_notification',
                data: {
                  productName: product.title,
                  buyerName,
                  amount,
                },
              }),
            });

            if (!emailResponse.ok) {
              console.error('Failed to send sale notification email');
            }
          } catch (emailError) {
            console.error('Error sending sale notification email:', emailError);
          }
        }

        console.log('Payment successful for product:', productId);

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
        const failedBuyerId = paymentIntent.metadata?.buyerId;
        const failedProductId = paymentIntent.metadata?.productId;
        const failedAmount = paymentIntent.amount / 100;

        // Fetch product to get seller ID
        let failedSellerId = null;
        if (failedProductId) {
          const { data: failedProduct } = await supabase
            .from('products')
            .select('user_id')
            .eq('id', failedProductId)
            .single();
          failedSellerId = failedProduct?.user_id;
        }

        const { error } = await supabase.from('orders').insert({
          customer_id: failedBuyerId,
          seller_id: failedSellerId,
          customer_email: paymentIntent.receipt_email || '',
          total_amount: failedAmount,
          currency: paymentIntent.currency?.toUpperCase() || 'USD',
          status: 'failed',
          payment_method: 'stripe',
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
