import {
  isValidEmail,
  isValidPassword,
  validateLogin,
  validateRegister,
} from "../src/utils/validation";

describe("Validation utilities", () => {
  test("accepts a valid email address", () => {
    expect(isValidEmail("student@example.com")).toBe(true);
  });

  test("rejects an invalid email address", () => {
    expect(isValidEmail("student-email")).toBe(false);
  });

  test("accepts password with at least 6 characters", () => {
    expect(isValidPassword("123456")).toBe(true);
  });

  test("rejects short password", () => {
    expect(isValidPassword("123")).toBe(false);
  });

  test("returns null for valid login input", () => {
    expect(validateLogin("student@example.com", "123456")).toBeNull();
  });

  test("detects mismatched registration passwords", () => {
    expect(
      validateRegister("Kartiki", "student@example.com", "123456", "654321")
    ).toBe("Passwords do not match.");
  });
});