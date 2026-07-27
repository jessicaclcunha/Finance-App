import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase não configurado: verifica se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas nas variáveis de ambiente do teu provedor de deploy (Vercel)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);