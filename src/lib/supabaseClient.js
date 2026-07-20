import { createClient } from "@supabase/supabase-js";

// ── Fill these in with your Supabase project credentials ──
// Project Settings → API → Project URL / anon public key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export const STORAGE_BUCKET = "signatures";
export const TABLE_NAME = "signature_logs";
