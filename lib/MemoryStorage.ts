import {
  DEFAULT_STORAGE_KEY,
  ISafeLocalStorage,
  ISafeLocalStorageConfig
} from "./SafeLocalStorage";

interface IMemoryStorage<T> extends ISafeLocalStorage<T> {
  readonly DATA: { [key: string]: T };
}

class MemoryStorage<T> implements IMemoryStorage<T> {
  public readonly DATA: { [key: string]: T } = {};
  private readonly KEY: string;
  private readonly DEFAULT_VALUE: T;

  constructor(config: ISafeLocalStorageConfig<T>) {
    const { key, defaultValue } = config;

    this.DATA = {};
    this.KEY = key || DEFAULT_STORAGE_KEY;
    this.DEFAULT_VALUE = defaultValue;
  }

  public getItem = (): T => this.DATA[this.KEY] || this.DEFAULT_VALUE;
  public setItem = (data: T): boolean => {
    this.DATA[this.KEY] = data;
    return true;
  };
}

export default MemoryStorage;
