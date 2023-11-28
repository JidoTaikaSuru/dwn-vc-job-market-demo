import { createClient } from "@supabase/supabase-js";
import { Database } from "@/__generated__/supabase-types";
import { SupabaseCredentialManager } from "@/lib/client";

export const supabaseClient = createClient<Database>(
  "https://api.gotid.org",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVicG5ibnpwZm10YmJyZ2lnempxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwNjQzODIsImV4cCI6MjAxNTY0MDM4Mn0.fS_FBY4mDgYVn1GDocKMuze5y_s_ZlX5acQ-QAVcvG0",
);
export const credentialStore = new SupabaseCredentialManager();