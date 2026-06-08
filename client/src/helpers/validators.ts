export interface ValidationResult {
  valid: boolean;
  message?: string;
}

const ok: ValidationResult = { valid: true };

export function validateLogin(username: string, password: string): ValidationResult {
  if (!username.trim()) return { valid: false, message: "Username is required." };
  if (!password) return { valid: false, message: "Password is required." };
  return ok;
}

export function validateRegister(input: { username: string; email: string; password: string; bio: string }): ValidationResult {
  if (input.username.trim().length < 3 || input.username.trim().length > 40) return { valid: false, message: "Username must be 3-40 characters." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) return { valid: false, message: "Email format is invalid." };
  if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(input.password)) return { valid: false, message: "Password needs 8 characters, one uppercase letter and one number." };
  if (input.bio.length > 300) return { valid: false, message: "Bio can be up to 300 characters." };
  return ok;
}

export function validateCommunity(input: { name: string; description: string; type: string }): ValidationResult {
  if (input.name.trim().length < 2 || input.name.trim().length > 80) return { valid: false, message: "Community name must be 2-80 characters." };
  if (input.description.length > 500) return { valid: false, message: "Description can be up to 500 characters." };
  if (input.type !== "public" && input.type !== "private") return { valid: false, message: "Community type must be public or private." };
  return ok;
}

export function validatePost(input: { title: string; content: string }): ValidationResult {
  if (input.title.trim().length < 5 || input.title.trim().length > 200) return { valid: false, message: "Title must be 5-200 characters." };
  if (input.content.trim().length < 10 || input.content.trim().length > 10000) return { valid: false, message: "Content must be 10-10000 characters." };
  return ok;
}

export function validateComment(content: string): ValidationResult {
  if (content.trim().length < 1) return { valid: false, message: "Comment cannot be empty." };
  if (content.length > 2000) return { valid: false, message: "Comment can be up to 2000 characters." };
  return ok;
}

export function validateTag(name: string): ValidationResult {
  if (name.trim().length < 2 || name.trim().length > 40) return { valid: false, message: "Tag must be 2-40 characters." };
  return ok;
}
