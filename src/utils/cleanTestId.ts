export function cleanTestId(input: string | null | undefined): string | null {
  if (!input) return null;
  let str = String(input).trim();
  if (!str) return null;

  try {
    str = decodeURIComponent(str);
  } catch (e) {}

  // 1. Try to match query parameter like ?test=ID, &test=ID, ?testId=ID, or ?id=ID
  const queryMatch = str.match(/[?&](?:test|testId|id)=([^&#]+)/i);
  if (queryMatch && queryMatch[1]) {
    str = queryMatch[1].trim();
  } else if (str.includes('#test/')) {
    str = str.split('#test/')[1] || '';
  } else if (str.includes('#/test/')) {
    str = str.split('#/test/')[1] || '';
  } else if (str.includes('/test/')) {
    str = str.split('/test/')[1] || '';
  }

  // 2. Strip any remaining query strings or hash fragments
  str = str.split('?')[0].split('&')[0].split('#')[0].trim();

  // 3. Clean leading slashes or hashes
  while (str.startsWith('#') || str.startsWith('/')) {
    str = str.slice(1);
  }

  // If the result is a full URL or domain or invalid string, return null
  if (
    str.startsWith('http://') ||
    str.startsWith('https://') ||
    str.includes('://') ||
    str.includes('.com') ||
    str.includes('.app') ||
    str.includes('.onrender') ||
    str.includes('localhost') ||
    str.toLowerCase() === 'undefined' ||
    str.toLowerCase() === 'null' ||
    str.toLowerCase() === '[object object]'
  ) {
    return null;
  }

  // 4. Strip prefixes like 'test/' or 'test='
  if (str.toLowerCase().startsWith('test/')) {
    str = str.slice(5);
  } else if (str.toLowerCase().startsWith('test=')) {
    str = str.slice(5);
  }

  str = str.trim();

  if (!str || str === '/' || str === '#' || str.length < 2) return null;

  return str;
}
