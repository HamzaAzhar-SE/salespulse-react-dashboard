const DEFAULT_API_URL = 'http://localhost:3001';

/**
 * Where the data comes from.
 * - Development: the mock API from "npm run api".
 * - Deployed site: JSON files in /data, because a static host cannot run the mock API.
 *   They are made from mock/db.json by "npm run build" (see scripts/export-static-data.mjs).
 * Pass plain paths like "/orders". Query strings are not supported in the static version.
 */
export function buildUrl(path: string): string {
  if (import.meta.env.VITE_STATIC_DATA === 'true') {
    return `${import.meta.env.BASE_URL}data${path}.json`;
  }
  const base = (import.meta.env.VITE_API_URL as string | undefined) ?? DEFAULT_API_URL;
  return `${base}${path}`;
}

/** Small wrapper around fetch. Throws an Error with a readable message on failure. */
export async function getJson<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(buildUrl(path));
  } catch {
    throw new Error('Cannot reach the API. Is "npm run api" running in another terminal?');
  }
  if (!response.ok) {
    throw new Error(`The server answered with an error (${response.status}).`);
  }
  return (await response.json()) as T;
}
