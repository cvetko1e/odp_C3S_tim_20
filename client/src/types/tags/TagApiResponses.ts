import type { Tag } from "./Tag";

export interface TagListResponse {
  success: boolean;
  data?: Tag[];
  message?: string;
}

export interface TagSingleResponse {
  success: boolean;
  data?: Tag | null;
  message?: string;
}

export interface TagActionResponse {
  success: boolean;
  message?: string;
}
