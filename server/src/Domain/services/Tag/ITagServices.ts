import { Tag } from '../../models/Tag';

export interface ITagService {
  getAllTags(): Promise<Tag[]>;
  createTag(name: string, createdBy: number): Promise<Tag>;
  deleteTag(id: number): Promise<boolean>;
}

