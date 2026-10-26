const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001';

/** Small wrapper around fetch. Throws an Error with a readable message on failure. */
export async function getJson<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`);
  } catch {
    throw new Error('Cannot reach the API. Is "npm run api" running in another terminal?');
  }
  if (!response.ok) {
    throw new Error(`The server answered with an error (${response.status}).`);
  }
  return (await response.json()) as T;
}
