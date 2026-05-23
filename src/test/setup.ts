import "@testing-library/jest-dom/vitest";

const storage = new Map<string, string>();

const testLocalStorage: Storage = {
  get length() {
    return storage.size;
  },
  clear() {
    storage.clear();
  },
  getItem(key: string) {
    return storage.get(key) ?? null;
  },
  key(index: number) {
    return Array.from(storage.keys())[index] ?? null;
  },
  removeItem(key: string) {
    storage.delete(key);
  },
  setItem(key: string, value: string) {
    storage.set(key, String(value));
  }
};

Object.defineProperty(window, "localStorage", {
  value: testLocalStorage,
  configurable: true
});
