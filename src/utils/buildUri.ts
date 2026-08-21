export function buildUri(uri: string, parameters: Record<string, string>): string {
  const url = new URL(uri);

  for (const [key, value] of Object.entries(parameters)) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}
