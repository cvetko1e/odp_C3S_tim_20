import { Tag } from '../../models/Tag';

export interface ITagRepository {
  findAll(): Promise<Tag[]>;
  findById(id: number): Promise<Tag | null>;
  findByName(name: string): Promise<Tag | null>;
  create(name: string, createdBy: number): Promise<Tag | null>;
  delete(id: number): Promise<boolean>;
}
