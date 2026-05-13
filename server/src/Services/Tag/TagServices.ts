import { ITagService } from '../../Domain/services/Tag/ITagServices';
import { ITagRepository } from '../../Domain/repositories/Tag/ITagRepository';
import { Tag } from '../../Domain/models/Tag';

export class TagService implements ITagService {
  public constructor(private readonly tagRepo: ITagRepository) {}

  public async getAllTags(): Promise<Tag[]> {
    return await this.tagRepo.findAll();
  }

  public async createTag(name: string): Promise<Tag> {
    const existing = await this.tagRepo.findByName(name);
    if (existing) return existing;
    return await this.tagRepo.create(name);
  }

  public async deleteTag(id: number): Promise<boolean> {
    return await this.tagRepo.delete(id);
  }
}
