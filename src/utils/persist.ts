const PREFIX = 'clm_';

export function loadPersist<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw) {
      return JSON.parse(raw) as T;
    }
  } catch (e) {
    console.warn('Failed to load persist:', key, e);
  }
  return defaultValue;
}

export function savePersist<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn('Failed to save persist:', key, e);
  }
}

export function clearPersist(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch (e) {
    console.warn('Failed to clear persist:', key, e);
  }
}
