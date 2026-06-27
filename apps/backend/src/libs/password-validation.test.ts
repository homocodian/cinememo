import { describe, expect, test } from "bun:test";

import { validatePassword } from "./password-validation";

describe("validatePassword", () => {
  test("should return false for passwords shorter than 8 characters", () => {
    const result = validatePassword("Ab1!");
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test("should return false for passwords without digits", () => {
    const result = validatePassword("Ab1!");
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test("should return false for passwords without special symbols", () => {
    const result = validatePassword("Ab1!");
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test("should return false for passwords without uppercase letters", () => {
    const result = validatePassword("Ab1!");
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test("should return false for passwords without lowercase letters", () => {
    const result = validatePassword("Ab1!");
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test("should return false for passwords with whitespace", () => {
    const result = validatePassword("Abc def1!");
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test("should return true for valid passwords", () => {
    expect(validatePassword("Valid1!a")).toEqual({
      ok: true,
      error: null
    });
  });
});
