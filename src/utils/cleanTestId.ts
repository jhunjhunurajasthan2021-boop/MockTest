export function cleanTestId(input: string | null | undefined): string | null {
  if (!input) return null;
  let str = String(input).trim();
  try {
    str = decodeURIComponent(str);
  } catch (e) {}

  // 1. Try to match query parameter like ?test=ID, &test=ID, ?testId=ID, or ?id=ID
  const queryMatch = str.match(/[?&](?:test|testId|id)=([^&#]+)/i);
  if (queryMatch && queryMatch[1]) {
    str = queryMatch[1];
  } else if (str.includes('#test/')) {
    str = str.split('#test/')[1] || str;
  } else if (str.includes('/test/')) {
    str = str.split('/test/')[1] || str;
  } else if (str.includes('#/test/')) {
    str = str.split('#/test/')[1] || str;
  }

  // 2. Strip any remaining query strings or hash fragments
  str = str.split('?')[0].split('&')[0].split('#')[0];

  // 3. Clean leading slashes or hashes
  while (str.startsWith('#') || str.startsWith('/')) {
    str = str.slice(1);
  }

  // 4. Strip prefixes like 'test/' or 'test='
  if (str.toLowerCase().startsWith('test/')) {
    str = str.slice(5);
  } else if (str.toLowerCase().startsWith('test=')) {
    str = str.slice(5);
  }

  return str.trim() || null;
}
