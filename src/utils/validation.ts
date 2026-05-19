export function isValidEmail(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

export function validateLogin(email: string, password: string): string | null {
  if (!email.trim()) return "Email is required.";
  if (!isValidEmail(email)) return "Please enter a valid email address.";
  if (!password.trim()) return "Password is required.";
  if (!isValidPassword(password)) return "Password must be at least 6 characters.";
  return null;
}

export function validateRegister(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): string | null {
  if (!name.trim()) return "Full name is required.";
  if (!email.trim()) return "Email is required.";
  if (!isValidEmail(email)) return "Please enter a valid email address.";
  if (!password.trim()) return "Password is required.";
  if (!isValidPassword(password)) return "Password must be at least 6 characters.";
  if (password !== confirmPassword) return "Passwords do not match.";
  return null;
}