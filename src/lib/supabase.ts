import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type SupabaseClientOptions = {
  useServiceRole?: boolean;
};

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set.");
  }

  // Users sometimes paste REST endpoint URLs; normalize to project root URL.
  return url.replace(/\/rest\/v1\/?$/, "");
}

function getSupabaseKey({ useServiceRole = false }: SupabaseClientOptions) {
  if (useServiceRole) {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!key) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
    }

    return key;
  }

  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set.");
  }

  return key;
}

const globalForSupabase = globalThis as unknown as {
  supabaseAdmin?: SupabaseClient;
};

export function getSupabaseClient() {
  return createClient(getSupabaseUrl(), getSupabaseKey({ useServiceRole: false }));
}

export function getSupabaseAdmin() {
  if (globalForSupabase.supabaseAdmin) {
    return globalForSupabase.supabaseAdmin;
  }

  const admin = createClient(getSupabaseUrl(), getSupabaseKey({ useServiceRole: true }), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  if (process.env.NODE_ENV !== "production") {
    globalForSupabase.supabaseAdmin = admin;
  }

  return admin;
}
