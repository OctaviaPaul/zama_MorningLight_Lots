/**
 * Generic localStorage wrapper for string values
 */
export class GenericStringStorage {
  constructor(private readonly keyPrefix: string) {}

  get(suffix: string): string | null {
    const key = `${this.keyPrefix}.${suffix}`;
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  }

  set(suffix: string, value: string): void {
    const key = `${this.keyPrefix}.${suffix}`;
    if (typeof window === "undefined") return;
    localStorage.setItem(key, value);
  }

  remove(suffix: string): void {
    const key = `${this.keyPrefix}.${suffix}`;
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  }

  clear(): void {
    if (typeof window === "undefined") return;
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(this.keyPrefix)) {
        localStorage.removeItem(key);
      }
    });
  }
}

