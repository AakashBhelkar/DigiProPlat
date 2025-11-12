import { loadStripe, Stripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mafryhnhgopxfckrepxv.supabase.co';

if (!stripePublishableKey) {
  console.warn('Missing Stripe publishable key. Payment features will not work.');
}

// Initialize Stripe
let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise && stripePublishableKey) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

// Get authentication token for Supabase edge functions
const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  return headers;
};

// Create payment intent on the server using Supabase edge function
export const createPaymentIntent = async (
  amount: number,
  currency: string = 'usd',
  productId?: string,
  productName?: string
) => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${supabaseUrl}/functions/v1/create-payment-intent`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        productId: productId || '',
        productName: productName || '',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create payment intent' }));
      throw new Error(errorData.error || 'Failed to create payment intent');
    }

    const data = await response.json();
    return data.clientSecret;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Create a checkout session (for hosted Stripe Checkout) using Supabase edge function
export const createCheckoutSession = async (
  productId: string,
  productPrice: number,
  productName: string,
  sellerId: string,
  productImage?: string,
  buyerId?: string,
  couponCode?: string
) => {
  try {
    // Get current user ID if not provided
    if (!buyerId) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('User must be authenticated to create checkout session');
      }
      buyerId = session.user.id;
    }

    const headers = await getAuthHeaders();
    
    const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        productId,
        productPrice: Math.round(productPrice * 100), // Convert to cents
        productName,
        productImage,
        buyerId,
        sellerId,
        couponCode,
        successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/marketplace`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create checkout session' }));
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Redirect to Stripe Checkout
export const redirectToCheckout = async (sessionId: string) => {
  const stripe = await getStripe();

  if (!stripe) {
    throw new Error('Stripe not initialized');
  }

  const { error } = await stripe.redirectToCheckout({ sessionId });

  if (error) {
    console.error('Error redirecting to checkout:', error);
    throw error;
  }
};

// Format currency for display
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Validate card number using Luhn algorithm
export const validateCardNumber = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\D/g, '');

  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

// Get card brand from card number
export const getCardBrand = (cardNumber: string): string => {
  const digits = cardNumber.replace(/\D/g, '');

  if (/^4/.test(digits)) return 'visa';
  if (/^5[1-5]/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  if (/^6(?:011|5)/.test(digits)) return 'discover';
  if (/^(?:2131|1800|35)/.test(digits)) return 'jcb';

  return 'unknown';
};

export default { getStripe, createPaymentIntent, createCheckoutSession, redirectToCheckout, formatCurrency };
