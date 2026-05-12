import { ValidationResult } from "../../../Domain/types/ValidationResult";
import { CreateCommunityDto } from "../../../Domain/DTOs/communities/CreateCommunityDto";
import { UpdateCommunityDto } from "../../../Domain/DTOs/communities/UpdateCommunityDto";

const isValidType = (value: string): boolean => value === "public" || value === "private";

export const validateCreateCommunity = (dto: CreateCommunityDto): ValidationResult => {
  const name = dto.name.trim();
  if (name.length < 2 || name.length > 80) {
    return { valid: false, message: "Name must be between 2 and 80 characters" };
  }

  if (dto.description !== null && dto.description.length > 500) {
    return { valid: false, message: "Description must be at most 500 characters" };
  }

  if (!isValidType(dto.type)) {
    return { valid: false, message: "Type must be 'public' or 'private'" };
  }

  return { valid: true };
};

export const validateUpdateCommunity = (dto: UpdateCommunityDto): ValidationResult => {
  if (dto.name !== undefined) {
    const name = dto.name.trim();
    if (name.length < 2 || name.length > 80) {
      return { valid: false, message: "Name must be between 2 and 80 characters" };
    }
  }

  if (dto.description !== undefined && dto.description !== null && dto.description.length > 500) {
    return { valid: false, message: "Description must be at most 500 characters" };
  }

  if (dto.type !== undefined && !isValidType(dto.type)) {
    return { valid: false, message: "Type must be 'public' or 'private'" };
  }

  return { valid: true };
};
