import { serve } from 'std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const ENCRYPTION_SECRET = Deno.env.get('AI_KEY_SECRET');
if (!ENCRYPTION_SECRET) throw new Error('Missing AI_KEY_SECRET env variable');

// --- Replace Node.js crypto with Web Crypto API ---
async function encrypt(text: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey(
    'raw',
    hexToBytes(ENCRYPTION_SECRET),
    'AES-GCM',
    false,
    ['encrypt']
  );
  const enc = new TextEncoder().encode(text);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc
  );
  // No auth tag in Web Crypto, it's part of the ciphertext
  return btoa(String.fromCharCode(...iv, ...new Uint8Array(encrypted)));
}

async function decrypt(text: string): Promise<string> {
  const data = Uint8Array.from(atob(text), c => c.charCodeAt(0));
  const iv = data.slice(0, 12);
  const encrypted = data.slice(12);
  const key = await crypto.subtle.importKey(
    'raw',
    hexToBytes(ENCRYPTION_SECRET),
    'AES-GCM',
    false,
    ['decrypt']
  );
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  );
  return new TextDecoder().decode(decrypted);
}

function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) throw new Error('Invalid hex string');
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    arr[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return arr;
}

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response('Unauthorized', { status: 401 });
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    if (userError || !user) return new Response('Unauthorized', { status: 401 });

    if (path === 'save-key' && req.method === 'POST') {
      const { apiKey, model } = await req.json();
      if (!apiKey || !model) return new Response(JSON.stringify({ error: 'Missing API key or model' }), { status: 400 });
      const encrypted = await encrypt(apiKey);
      // Upsert the key
      const { error } = await supabase
        .from('user_api_keys')
        .upsert({ user_id: user.id, provider: 'openai', api_key_encrypted: encrypted }, { onConflict: 'user_id,provider' });
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      // Optionally store model preference in a user_settings table
      // ...
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    if (path === 'remove-key' && req.method === 'POST') {
      const { error } = await supabase
        .from('user_api_keys')
        .delete()
        .eq('user_id', user.id)
        .eq('provider', 'openai');
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    if (path === 'test-key' && req.method === 'POST') {
      const { model } = await req.json();
      // Fetch and decrypt the key
      const { data: keyRow, error: keyError } = await supabase
        .from('user_api_keys')
        .select('api_key_encrypted')
        .eq('user_id', user.id)
        .eq('provider', 'openai')
        .single();
      if (keyError || !keyRow) return new Response(JSON.stringify({ error: 'No OpenAI API key found.' }), { status: 400 });
      let apiKey: string;
      try {
        apiKey = await decrypt(keyRow.api_key_encrypted);
      } catch {
        return new Response(JSON.stringify({ error: 'Failed to decrypt API key.' }), { status: 400 });
      }
      // Make a test request to OpenAI
      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Say hello.' }
          ],
          max_tokens: 10
        })
      });
      if (!openaiRes.ok) {
        const err = await openaiRes.json();
        return new Response(JSON.stringify({ error: err.error?.message || 'OpenAI API error' }), { status: 400 });
      }
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response('Not found', { status: 404 });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}); 