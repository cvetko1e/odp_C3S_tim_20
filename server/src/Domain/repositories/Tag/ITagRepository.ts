import { Tag } from '../../models/Tag';

export interface ITagRepository {
  findAll(): Promise<Tag[]>;
  findById(id: number): Promise<Tag>;
  findByName(name: string): Promise<Tag>;
  create(name: string, createdBy: number): Promise<Tag>;
  delete(id: number): Promise<boolean>;
}

