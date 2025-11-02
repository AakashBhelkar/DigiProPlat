import { serve } from 'std/server';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import crypto from 'crypto';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const ENCRYPTION_SECRET = Deno.env.get('AI_KEY_SECRET');
if (!ENCRYPTION_SECRET) throw new Error('Missing AI_KEY_SECRET env variable');

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

async function decrypt(text: string): Promise<string> {
  const data = Uint8Array.from(atob(text), c => c.charCodeAt(0));
  const iv = data.slice(0, 12);
  const tag = data.slice(12, 28);
  const encrypted = data.slice(28);
  
  const key = await crypto.subtle.importKey(
    'raw',
    hexToBytes(ENCRYPTION_SECRET),
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv, tagLength: 128 },
    key,
    new Uint8Array([...encrypted, ...tag])
  );
  
  return new TextDecoder().decode(decrypted);
}

serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response('Unauthorized', { status: 401 });
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    if (userError || !user) return new Response('Unauthorized', { status: 401 });

    const { prompt } = await req.json();
    if (!prompt) return new Response('Missing prompt', { status: 400 });

    // Fetch encrypted API key
    const { data: keyRow, error: keyError } = await supabase
      .from('user_api_keys')
      .select('api_key_encrypted')
      .eq('user_id', user.id)
      .eq('provider', 'openai')
      .single();
    if (keyError || !keyRow) {
      return new Response(JSON.stringify({ error: 'No OpenAI API key found. Please add your key in Settings.' }), { status: 400 });
    }

    let apiKey: string;
    try {
      apiKey = await decrypt(keyRow.api_key_encrypted);
    } catch {
      return new Response(JSON.stringify({ error: 'Failed to decrypt API key. Please update your key.' }), { status: 400 });
    }

    // Call OpenAI API
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an expert landing page builder AI. Generate a JSON object for a landing page section based on the user prompt.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });
    if (!openaiRes.ok) {
      const err = await openaiRes.json();
      return new Response(JSON.stringify({ error: err.error?.message || 'OpenAI API error' }), { status: 400 });
    }
    const openaiData = await openaiRes.json();
    // Expecting the AI to return a JSON object as the first message content
    let section;
    try {
      const content = openaiData.choices[0].message.content;
      section = JSON.parse(content);
    } catch {
      return new Response(JSON.stringify({ error: 'Failed to parse AI response. Try a different prompt.' }), { status: 400 });
    }
    return new Response(JSON.stringify({ section }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
  }
});