import MemoryStorage from "../MemoryStorage";
import SafeLocalStorage, {
  DEFAULT_STORAGE_KEY,
  isLocalStorageSupported,
  SafeLocalStorage as SafeLocalStorageClass
} from "./../SafeLocalStorage";

describe("SafeLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe("isLocalStorageSupported", () => {
    it("is supported", () => {
      expect(isLocalStorageSupported()).toBe(true);
    });

    it("not supported", () => {
      const spy = jest.spyOn(localStorage, "setItem");

      spy.mockImplementationOnce(() => {
        throw new Error("Dead");
      });

      expect(isLocalStorageSupported()).toBe(false);
      expect(localStorage.setItem).toHaveBeenCalled();
      expect(localStorage.removeItem).not.toHaveBeenCalled();
    });
  });

  describe("storage", () => {
    it("supports localStorage", () => {
      expect(
        SafeLocalStorage({ key: "test", defaultValue: ["test"] })
      ).toBeInstanceOf(SafeLocalStorageClass);
    });

    it("has defaults", () => {
      const storage = SafeLocalStorage({ defaultValue: [] });
      expect((storage as any).KEY).toBe(DEFAULT_STORAGE_KEY);
      expect((storage as any).DEFAULT_VALUE).toEqual([]);
    });

    it("does not support localStorage -> uses memorystorage", () => {
      const spy = jest.spyOn(localStorage, "setItem");

      spy.mockImplementationOnce(() => {
        throw new Error("Dead");
      });

      expect(
        SafeLocalStorage({ key: "test", defaultValue: ["test"] })
      ).toBeInstanceOf(MemoryStorage);
    });
  });

  describe("getItem", () => {
    const storage = SafeLocalStorage({ key: "test", defaultValue: ["test"] });

    it("has default", () => {
      expect(storage.getItem()).toEqual(["test"]);
    });

    it("handles error", () => {
      localStorage.setItem("test", "some\\werror");

      expect(storage.getItem).not.toThrowError();
      expect(storage.getItem()).toEqual(["test"]);
    });
  });

  describe("setItem", () => {
    const storage = SafeLocalStorage<Array<{ query: string }>>({
      defaultValue: [],
      key: "some_key"
    });

    it("stringifies to storage", () => {
      storage.setItem([{ query: "something" }]);
      expect(localStorage.__STORE__).toEqual({
        some_key: '[{"query":"something"}]'
      });
    });

    it("calls removeItem if storage is full", () => {
      const spy = jest.spyOn(localStorage, "setItem");
      spy.mockImplementation(() => {
        throw new Error("Dead");
      });

      expect(storage.setItem([])).toBe(false);
    });
  });
});
