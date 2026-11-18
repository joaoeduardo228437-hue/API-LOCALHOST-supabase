import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export let supabaseConfigError = null;
let supabase = null;

if (!supabaseUrl || !supabaseAnonKey) {
  supabaseConfigError =
    'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env na raiz do projeto.';
} else {
  try {
    const url = new URL(supabaseUrl);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) {
      throw new Error('URL inválida');
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch {
    supabaseConfigError =
      'VITE_SUPABASE_URL inválida. Informe a URL do projeto Supabase no arquivo .env.';
  }
}

if (supabaseConfigError) {
  console.error(`[Supabase] ${supabaseConfigError}`);
}

export { supabase };
