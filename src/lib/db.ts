import { Pool, type QueryResult, type QueryResultRow } from "pg";

const CONNECTION_ERROR_CODES = new Set([
  "EAI_AGAIN",
  "ECONNRESET",
  "ECONNREFUSED",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ENOTFOUND",
  "ETIMEDOUT",
]);

function parseConnectionString(rawValue: string, variableName: string) {
  const connectionString = rawValue
    .trim()
    .replace(new RegExp(`^${variableName}=`, "i"), "")
    .replace(/^['"]|['"]$/g, "");

  let hostname = "";
  try {
    const parsed = new URL(connectionString);
    if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
      throw new Error("invalid protocol");
    }
    hostname = parsed.hostname;
  } catch {
    throw new Error(
      `${variableName} is not a valid URI. Use format: postgresql://USER:PASSWORD@HOST:PORT/DB_NAME`,
    );
  }

  if (hostname === "base") {
    throw new Error(
      `${variableName} hostname is 'base', which is invalid. Set it to your full Supabase/Postgres URI.`,
    );
  }

  return { connectionString, hostname };
}

function createPool(connectionString: string, hostname: string) {
  const isSupabaseHost =
    hostname.endsWith(".supabase.co") ||
    hostname.endsWith(".supabase.com") ||
    hostname.includes("pooler.supabase.com");

  return new Pool({
    connectionString,
    ssl: isSupabaseHost
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
  });
}

function isLocalHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function isConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const candidate = error as { code?: unknown; errors?: unknown[] };
  if (typeof candidate.code === "string" && CONNECTION_ERROR_CODES.has(candidate.code)) {
    return true;
  }

  return candidate.errors?.some(isConnectionError) ?? false;
}

const rawPrimaryConnectionString = process.env.DATABASE_URL;
const rawSupabaseConnectionString = process.env.SUPABASE_DB_URL;

if (!rawPrimaryConnectionString && !rawSupabaseConnectionString) {
  throw new Error(
    "DATABASE_URL (or SUPABASE_DB_URL) is not set. Use your Supabase Postgres connection string.",
  );
}

const primaryConfig = parseConnectionString(
  rawPrimaryConnectionString ?? rawSupabaseConnectionString!,
  rawPrimaryConnectionString ? "DATABASE_URL" : "SUPABASE_DB_URL",
);
const fallbackConfig =
  rawPrimaryConnectionString && rawSupabaseConnectionString && isLocalHost(primaryConfig.hostname)
    ? parseConnectionString(rawSupabaseConnectionString, "SUPABASE_DB_URL")
    : null;

type DbState = {
  activePool: Pool;
  fallbackPool: Pool | null;
  canFallback: boolean;
};

const globalForDb = globalThis as unknown as {
  dbState?: DbState;
};

const state =
  globalForDb.dbState ??
  ({
    activePool: createPool(primaryConfig.connectionString, primaryConfig.hostname),
    fallbackPool: fallbackConfig
      ? createPool(fallbackConfig.connectionString, fallbackConfig.hostname)
      : null,
    canFallback: Boolean(fallbackConfig),
  } satisfies DbState);

if (process.env.NODE_ENV !== "production") {
  globalForDb.dbState = state;
}

export const db = {
  async query<Row extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: unknown[],
  ): Promise<QueryResult<Row>> {
    const queriedPool = state.activePool;

    try {
      return await queriedPool.query<Row>(text, values);
    } catch (error) {
      if (!isConnectionError(error)) {
        throw error;
      }

      if (queriedPool !== state.activePool) {
        return state.activePool.query<Row>(text, values);
      }

      if (!state.canFallback || !state.fallbackPool) throw error;

      state.canFallback = false;
      state.activePool = state.fallbackPool;
      return state.activePool.query<Row>(text, values);
    }
  },
};
