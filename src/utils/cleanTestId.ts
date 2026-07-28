export function cleanTestId(input: string | null | undefined): string | null {
  if (!input) return null;
  let str = String(input).trim();
  try {
    str = decodeURIComponent(str);
  } catch (e) {}

  str = str.split('?')[0].split('&')[0];

  while (
    str.startsWith('#') ||
    str.startsWith('/') ||
    str.toLowerCase().startsWith('test/') ||
    str.toLowerCase().startsWith('test=')
  ) {
    if (str.startsWith('#')) {
      str = str.slice(1);
    } else if (str.startsWith('/')) {
      str = str.slice(1);
    } else if (str.toLowerCase().startsWith('test/')) {
      str = str.slice(5);
    } else if (str.toLowerCase().startsWith('test=')) {
      str = str.slice(5);
    }
  }

  return str.trim() || null;
}
