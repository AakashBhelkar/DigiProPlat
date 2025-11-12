import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MIN_WITHDRAWAL_AMOUNT = 10.0; // Minimum withdrawal amount

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

    const { amount, paymentMethod, paymentDetails } = await req.json();

    // Validate input
    if (!amount || amount <= 0) {
      throw new Error('Invalid withdrawal amount');
    }

    if (amount < MIN_WITHDRAWAL_AMOUNT) {
      throw new Error(`Minimum withdrawal amount is $${MIN_WITHDRAWAL_AMOUNT}`);
    }

    if (!paymentMethod) {
      throw new Error('Payment method is required');
    }

    // Get user profile to check wallet balance and KYC status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('wallet_balance, kyc_status')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found');
    }

    // Check KYC status
    if (profile.kyc_status !== 'verified') {
      throw new Error('KYC verification is required before making withdrawals. Please complete your identity verification first.');
    }

    // Check wallet balance
    const walletBalance = Number(profile.wallet_balance || 0);
    if (amount > walletBalance) {
      throw new Error(`Insufficient balance. Available: $${walletBalance.toFixed(2)}`);
    }

    // Check for pending withdrawal requests
    const { data: pendingRequests, error: pendingError } = await supabase
      .from('withdrawal_requests')
      .select('id')
      .eq('user_id', user.id)
      .in('status', ['pending', 'processing', 'approved'])
      .limit(1);

    if (pendingError) {
      console.error('Error checking pending requests:', pendingError);
    }

    if (pendingRequests && pendingRequests.length > 0) {
      throw new Error('You have a pending withdrawal request. Please wait for it to be processed.');
    }

    // Create withdrawal request
    const { data: withdrawalRequest, error: withdrawalError } = await supabase
      .from('withdrawal_requests')
      .insert({
        user_id: user.id,
        amount: amount,
        payment_method: paymentMethod,
        payment_details: paymentDetails || null,
        status: 'pending',
      })
      .select()
      .single();

    if (withdrawalError) {
      throw new Error(`Failed to create withdrawal request: ${withdrawalError.message}`);
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'withdrawal',
        amount: -amount, // Negative for withdrawal
        status: 'pending',
        payment_method: paymentMethod,
        description: `Withdrawal request #${withdrawalRequest.id.slice(0, 8)}`,
      });

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      // Continue even if transaction creation fails
    }

    // Note: We don't deduct from wallet_balance immediately - that happens when the withdrawal is approved/processed
    // This prevents users from withdrawing funds that are still pending

    return new Response(
      JSON.stringify({
        success: true,
        withdrawalRequest: {
          id: withdrawalRequest.id,
          amount: withdrawalRequest.amount,
          status: withdrawalRequest.status,
          created_at: withdrawalRequest.created_at,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error processing withdrawal request:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process withdrawal request' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

