import isValidQuery from "../string";

describe("isValidQuery", () => {
  it("valid", () => {
    expect(expect(isValidQuery("   some data   ")).toBe(true));
    expect(expect(isValidQuery(0)).toBe(true));
    expect(expect(isValidQuery(1000)).toBe(true));
  });

  it("invalid", () => {
    expect(isValidQuery("")).toBe(false);
    expect(isValidQuery("         ")).toBe(false);
    expect(isValidQuery(undefined)).toBe(false);
    expect(isValidQuery(null as any)).toBe(false);
  });
});
