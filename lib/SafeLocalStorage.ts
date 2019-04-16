import MemoryStorage from "./MemoryStorage";

export const DEFAULT_STORAGE_KEY = "__RECENT_SEARCHES__";
export const isLocalStorageSupported = (): boolean => {
  const key = "__TEST__KEY__";

  try {
    localStorage.setItem(key, "");
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    return false;
  }
};

export const safeDataParse = <T>(data: string | null, defaultValue: T): T => {
  if (!data) {
    return defaultValue;
  }

  try {
    return JSON.parse(data);
  } catch (e) {
    return defaultValue;
  }
};

export interface ISafeLocalStorageConfig<T> {
  defaultValue: T;
  key?: string;
  limit?: number;
}

export interface ISafeLocalStorage<T> {
  getItem: () => T;
  setItem: (item: T) => boolean;
}

export class SafeLocalStorage<T> implements ISafeLocalStorage<T> {
  private readonly KEY: string;
  private readonly DEFAULT_VALUE: T;

  constructor(config: ISafeLocalStorageConfig<T>) {
    const { key, defaultValue } = config;

    this.KEY = key || DEFAULT_STORAGE_KEY;
    this.DEFAULT_VALUE = defaultValue;
  }

  public getItem = (): T => {
    const data = localStorage.getItem(this.KEY);
    return safeDataParse(data, this.DEFAULT_VALUE);
  };

  public setItem = (items: T): boolean => {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(items));
      return true;
    } catch (e) {
      return false;
    }
  };
}

const NewSafeLocalStorage = <T>(
  config: ISafeLocalStorageConfig<T>
): SafeLocalStorage<T> | MemoryStorage<T> => {
  if (!isLocalStorageSupported()) {
    return new MemoryStorage(config);
  }

  return new SafeLocalStorage(config);
};

export default NewSafeLocalStorage;
