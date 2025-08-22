interface StorageData<T> {
  data: T;
  timestamp: number;
}

const STORAGE_EXPIRY_HOURS = 8;

export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    const storageData: StorageData<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(storageData));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

export const loadFromStorage = <T>(key: string): T | null => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const storageData: StorageData<T> = JSON.parse(stored);
    const now = Date.now();
    const expiryTime = storageData.timestamp + (STORAGE_EXPIRY_HOURS * 60 * 60 * 1000);

    if (now > expiryTime) {
      localStorage.removeItem(key);
      return null;
    }

    return storageData.data;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return null;
  }
};

export const clearExpiredStorage = (): void => {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();

    keys.forEach(key => {
      if (key.startsWith('retro-cards-')) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const storageData: StorageData<any> = JSON.parse(stored);
            const expiryTime = storageData.timestamp + (STORAGE_EXPIRY_HOURS * 60 * 60 * 1000);
            
            if (now > expiryTime) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          localStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.warn('Failed to clear expired storage:', error);
  }
};