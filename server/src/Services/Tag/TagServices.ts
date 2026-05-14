import { ITagService } from '../../Domain/services/Tag/ITagServices';
import { ITagRepository } from '../../Domain/repositories/Tag/ITagRepository';
import { Tag } from '../../Domain/models/Tag';

export class TagService implements ITagService {
  public constructor(private readonly tagRepo: ITagRepository) {}

  public async getAllTags(): Promise<Tag[]> {
    return this.tagRepo.findAll();
  }

  public async createTag(name: string, createdBy: number): Promise<Tag | null> {
    const existing = await this.tagRepo.findByName(name);
    if (existing) return existing;
    return this.tagRepo.create(name, createdBy);
  }

  public async deleteTag(id: number): Promise<boolean> {
    return this.tagRepo.delete(id);
  }
}
