# Stripe Payment Integration Guide

## 🚀 Complete Setup Guide

This guide will help you set up Stripe payments for DigiProPlat.

---

## **Part 1: Frontend Setup (Already Done ✅)**

The frontend is already configured with:
- ✅ Stripe.js and React Stripe Elements installed
- ✅ Stripe service helpers in `src/lib/stripe.ts`
- ✅ Checkout modal with payment form
- ✅ Environment variables configured

---

## **Part 2: Backend Setup (Required)**

You need to create a backend API to handle Stripe payments securely. **Never handle payments entirely on the client side!**

### **Option A: Supabase Edge Functions (Recommended)**

Create Stripe payment handlers using Supabase Edge Functions:

#### **1. Create Payment Intent Function**

```bash
npx supabase functions new create-payment-intent
```

File: `supabase/functions/create-payment-intent/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { amount, currency = 'usd' } = await req.json();

    if (!amount || amount < 50) {
      throw new Error('Amount must be at least $0.50');
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
```

#### **2. Create Checkout Session Function**

```bash
npx supabase functions new create-checkout-session
```

File: `supabase/functions/create-checkout-session/index.ts`

```typescript
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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      productId,
      productPrice,
      productName,
      productImage,
      successUrl,
      cancelUrl,
    } = await req.json();

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
              images: productImage ? [productImage] : [],
              metadata: {
                productId,
              },
            },
            unit_amount: productPrice,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        productId,
      },
    });

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
```

#### **3. Webhook Handler (Process Successful Payments)**

```bash
npx supabase functions new stripe-webhook
```

File: `supabase/functions/stripe-webhook/index.ts`

```typescript
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

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Create order in database
        const { error } = await supabase.from('orders').insert({
          product_id: session.metadata?.productId,
          buyer_id: session.client_reference_id, // Set this when creating session
          amount: session.amount_total! / 100,
          status: 'completed',
          stripe_session_id: session.id,
          payment_intent_id: session.payment_intent,
        });

        if (error) {
          console.error('Error creating order:', error);
        }

        // TODO: Send email with download links
        // TODO: Update product sales count

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
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error: any) {
    console.error('Webhook error:', error.message);
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }
});
```

#### **4. Deploy Edge Functions**

```bash
# Set Stripe secret key
npx supabase secrets set STRIPE_SECRET_KEY=your_stripe_test_secret_key_here

# Deploy functions
npx supabase functions deploy create-payment-intent
npx supabase functions deploy create-checkout-session
npx supabase functions deploy stripe-webhook
```

---

### **Option B: Custom Backend (Node.js/Express)**

If you prefer a traditional backend, here's a basic Express setup:

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

app.use(cors());
app.use(express.json());

// Create Payment Intent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { productId, productPrice, productName, successUrl, cancelUrl } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: productName },
          unit_amount: productPrice,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { productId },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Webhook Handler
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'checkout.session.completed':
        // Handle successful payment
        console.log('Payment successful!', event.data.object);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

---

## **Part 3: Stripe Dashboard Setup**

### **1. Get Your API Keys**

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy your keys:
   - **Publishable key:** `pk_test_...` (Already in `.env.local`)
   - **Secret key:** `sk_test_...` (Use in backend only!)

### **2. Configure Webhook**

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. Enter your webhook URL:
   - Supabase: `https://mafryhnhgopxfckrepxv.supabase.co/functions/v1/stripe-webhook`
   - Custom: `https://yourdomain.com/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Webhook signing secret** (`whsec_...`)
6. Add to Supabase secrets or environment variables

### **3. Test Mode**

- All keys starting with `pk_test_` and `sk_test_` are test mode
- Use test card numbers:
  - **Success:** `4242 4242 4242 4242`
  - **Decline:** `4000 0000 0000 0002`
  - Any future expiry date and any 3-digit CVC

---

## **Part 4: Frontend Integration**

### **Update API Endpoints**

In `src/lib/stripe.ts`, update the fetch URLs to point to your backend:

```typescript
// For Supabase Edge Functions
const response = await fetch(
  'https://mafryhnhgopxfckrepxv.supabase.co/functions/v1/create-payment-intent',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ amount: Math.round(amount * 100), currency }),
  }
);

// For custom backend
const response = await fetch('https://yourdomain.com/api/create-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: Math.round(amount * 100), currency }),
});
```

---

## **Part 5: Testing**

### **Test the Payment Flow**

1. Run the frontend: `npm run dev`
2. Navigate to Marketplace: `/marketplace`
3. Click "Buy Now" on any product
4. Use test card: `4242 4242 4242 4242`
5. Check Stripe Dashboard for the payment

### **Test Webhooks**

Use Stripe CLI for local testing:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local endpoint
stripe listen --forward-to localhost:3000/webhook

# Trigger test events
stripe trigger checkout.session.completed
```

---

## **Part 6: Go Live**

When ready for production:

1. **Switch to Live Mode**
   - Get live API keys from Stripe Dashboard
   - Update environment variables
   - Deploy backend to production

2. **Update Webhook Endpoint**
   - Point to production URL
   - Get new webhook signing secret

3. **Enable Payment Methods**
   - Enable additional payment methods in Stripe Dashboard
   - Apple Pay, Google Pay, etc.

4. **Setup Email Notifications**
   - Configure Supabase email templates
   - Send download links after payment

---

## **Security Checklist**

- [ ] **Never** expose secret keys in frontend code
- [ ] **Always** validate payments on the backend
- [ ] **Use** webhook signatures to verify events
- [ ] **Store** minimal payment data (never store full card numbers)
- [ ] **Comply** with PCI-DSS requirements
- [ ] **Use** HTTPS for all API endpoints
- [ ] **Implement** rate limiting on payment endpoints
- [ ] **Log** all payment attempts for security monitoring

---

## **📚 Resources**

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [PCI Compliance](https://stripe.com/docs/security/guide)

---

**Your Stripe integration is now ready! Complete the backend setup and you'll have a fully functional payment system.**
