import { ValidationResult } from "../../../Domain/types/ValidationResult";

const TAG_NAME_REGEX = /^[A-Za-z0-9 _-]+$/;

export const validateTag = (name: string): ValidationResult => {
  const trimmed = name.trim();

  if (trimmed.length < 2 || trimmed.length > 50) {
    return { valid: false, message: "Tag name must be between 2 and 50 characters" };
  }

  if (!TAG_NAME_REGEX.test(trimmed)) {
    return { valid: false, message: "Tag name contains invalid characters" };
  }

  return { valid: true };
};
