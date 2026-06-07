import { Tag } from '../../models/Tag';
import { ServiceResult } from '../../types/ServiceResult';

export interface ITagService {
  getAllTags(): Promise<Tag[]>;
  createTag(name: string, createdBy: number): Promise<ServiceResult<Tag>>;
  deleteTag(id: number): Promise<ServiceResult<boolean>>;
}

