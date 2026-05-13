import { Tag } from '../../models/Tag';

export interface ITagService {
  getAllTags(): Promise<Tag[]>;
  createTag(name: string): Promise<Tag>;
  deleteTag(id: number): Promise<boolean>;
}
