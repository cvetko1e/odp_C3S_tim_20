import { ValidationResult } from "../../../Domain/types/ValidationResult";

interface PostCreateInput {
  title?: string;
  content?: string;
  imageUrl?: string | null;
  communityId?: number;
  tagIds?: number[];
}

interface PostUpdateInput {
  title?: string;
  content?: string;
  imageUrl?: string | null;
}

const isPositiveInt = (value: number): boolean => Number.isInteger(value) && value > 0;

export const validateCreatePost = (input: PostCreateInput): ValidationResult => {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const content = typeof input.content === "string" ? input.content.trim() : "";

  if (title.length < 5 || title.length > 200) {
    return { valid: false, message: "Title must be between 5 and 200 characters" };
  }

  if (content.length < 10 || content.length > 10000) {
    return { valid: false, message: "Content must be between 10 and 10000 characters" };
  }

  if (!isPositiveInt(input.communityId ?? 0)) {
    return { valid: false, message: "communityId must be a positive number" };
  }

  if (input.imageUrl !== undefined && input.imageUrl !== null) {
    if (typeof input.imageUrl !== "string" || input.imageUrl.length > 1000) {
      return { valid: false, message: "imageUrl must be at most 1000 characters" };
    }
  }

  if (input.tagIds !== undefined) {
    if (!Array.isArray(input.tagIds)) {
      return { valid: false, message: "tagIds must be an array of positive numbers" };
    }

    const allValid = input.tagIds.every((tagId) => isPositiveInt(tagId));
    if (!allValid) {
      return { valid: false, message: "tagIds must contain only positive numbers" };
    }
  }

  return { valid: true };
};

export const validateUpdatePost = (input: PostUpdateInput): ValidationResult => {
  let hasValidField = false;

  if (input.title !== undefined) {
    const title = typeof input.title === "string" ? input.title.trim() : "";
    if (title.length < 5 || title.length > 200) {
      return { valid: false, message: "Title must be between 5 and 200 characters" };
    }
    hasValidField = true;
  }

  if (input.content !== undefined) {
    const content = typeof input.content === "string" ? input.content.trim() : "";
    if (content.length < 10 || content.length > 10000) {
      return { valid: false, message: "Content must be between 10 and 10000 characters" };
    }
    hasValidField = true;
  }

  if (input.imageUrl !== undefined) {
    if (input.imageUrl !== null && (typeof input.imageUrl !== "string" || input.imageUrl.length > 1000)) {
      return { valid: false, message: "imageUrl must be null or at most 1000 characters" };
    }
    hasValidField = true;
  }

  if (!hasValidField) {
    return { valid: false, message: "At least one field must be provided for update" };
  }

  return { valid: true };
};
