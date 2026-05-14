import { Tag } from '../../models/Tag';

export interface ITagService {
  getAllTags(): Promise<Tag[]>;
  createTag(name: string, createdBy: number): Promise<Tag | null>;
  deleteTag(id: number): Promise<boolean>;
}
