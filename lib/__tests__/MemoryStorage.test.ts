import MemoryStorage from "./../MemoryStorage";

describe("MemoryStorage", () => {
  describe("setItem", () => {
    const storage = new MemoryStorage({
      defaultValue: ["test"],
      key: "some_key"
    });

    it("default value", () => {
      expect(storage.getItem()).toEqual(["test"]);
    });
  });

  describe("setItem", () => {
    const storage = new MemoryStorage({
      defaultValue: ["test"],
      key: "some_key"
    });

    expect(storage.setItem(["test", "new_test"])).toBe(true);
    expect(storage.getItem()).toEqual(["test", "new_test"]);
  });
});
