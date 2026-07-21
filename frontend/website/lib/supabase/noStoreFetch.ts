/**
 * Next.js caches `fetch` by default. Supabase uses fetch for PostgREST GETs,
 * so wrap every server-side Supabase client with this to always hit the DB.
 */
export function noStoreFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  return fetch(input, {
    ...init,
    cache: "no-store",
  });
}
