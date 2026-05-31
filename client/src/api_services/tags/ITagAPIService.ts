import type { Tag } from "../../types/tags/Tag";

export interface ITagAPIService {
  getAllTags(): Promise<Tag[]>;
  createTag(token: string, name: string): Promise<Tag>;
  deleteTag(token: string, id: number): Promise<boolean>;
}

