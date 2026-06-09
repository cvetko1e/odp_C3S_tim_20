import { UpdateUserProfileDto } from "../../../Domain/DTOs/users/UpdateUserProfileDto";
import { ValidationResult } from "../../../Domain/types/ValidationResult";

export const validateUserProfile = (dto: UpdateUserProfileDto): ValidationResult => {
  if (dto.username !== undefined && (dto.username.length < 3 || dto.username.length > 40 || !/^[a-zA-Z0-9-]+$/.test(dto.username))) {
    return { valid: false, message: "Username must be 3-40 alphanumeric characters" };
  }

  if (dto.firstName !== undefined && (dto.firstName.length < 2 || dto.firstName.length > 100)) {
    return { valid: false, message: "First name must be 2-100 characters" };
  }

  if (dto.lastName !== undefined && (dto.lastName.length < 2 || dto.lastName.length > 100)) {
    return { valid: false, message: "Last name must be 2-100 characters" };
  }

  if (dto.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email)) {
    return { valid: false, message: "Invalid email address" };
  }

  if (dto.bio !== undefined && dto.bio.length > 300) {
    return { valid: false, message: "Bio must be 300 characters or fewer" };
  }

  if (dto.profileImage !== undefined && dto.profileImage !== "" && !dto.profileImage.startsWith("data:image/")) {
    return { valid: false, message: "Profile image must be a base64 image string" };
  }

  return { valid: true };
};
