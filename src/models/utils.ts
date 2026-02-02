export type Json = Record<string, any> | any[] | string | number | boolean | null;

export function toEnumLike(str: string): string {
  return str.toUpperCase().replace(/\s+/g, '_');
}
