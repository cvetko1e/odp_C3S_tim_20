import { ValidationResult } from "../../../Domain/types/ValidationResult";

export const validateRegister = (
  u: string,
  firstName: string,
  lastName: string,
  e: string,
  p: string,
  bio: string | null,
  profileImage: string | null,
): ValidationResult => {
  if (!u || u.trim().length < 3 || u.length > 40 || !/^[a-zA-Z0-9-]+$/.test(u))
    return { valid: false, message: "Username must be 3-40 alphanumeric characters" };
  if (!firstName || firstName.trim().length < 2 || firstName.trim().length > 100)
    return { valid: false, message: "First name must be 2-100 characters" };
  if (!lastName || lastName.trim().length < 2 || lastName.trim().length > 100)
    return { valid: false, message: "Last name must be 2-100 characters" };
  if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
    return { valid: false, message: "Invalid email address" };
  if (!p || p.length < 8 || !/[A-Z]/.test(p) || !/[0-9]/.test(p))
    return { valid: false, message: "Password must be 8+ chars with at least one uppercase and one number" };
  if (bio !== null && bio.length > 300)
    return { valid: false, message: "Bio must be 300 characters or fewer" };
  if (profileImage !== null && !profileImage.startsWith("data:image/"))
    return { valid: false, message: "Profile image must be a base64 image string" };
  return { valid: true };
};
