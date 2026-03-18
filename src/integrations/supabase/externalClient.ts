import { createClient } from '@supabase/supabase-js';

const EXTERNAL_SUPABASE_URL = "https://yrdsfqlhdsuhxjyugepd.supabase.co";
const EXTERNAL_SUPABASE_ANON_KEY = "sb_publishable_5D143ItWC3VYY810pu3-pQ_cnUeYt-Q";

export const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY);
