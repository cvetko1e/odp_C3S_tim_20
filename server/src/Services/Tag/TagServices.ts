import { ITagService } from '../../Domain/services/Tag/ITagServices';
import { ITagRepository } from '../../Domain/repositories/Tag/ITagRepository';
import { Tag } from '../../Domain/models/Tag';
import { ServiceResult } from '../../Domain/types/ServiceResult';

export class TagService implements ITagService {
  public constructor(private readonly tagRepo: ITagRepository) {}

  public async getAllTags(): Promise<Tag[]> {
    return this.tagRepo.findAll();
  }

  public async createTag(name: string, createdBy: number): Promise<ServiceResult<Tag>> {
       const existing = await this.tagRepo.findByName(name);
       if (existing.id !== 0) {
            return { success: false, status: 409, message: "Tag already exists", data: null };
       }
       const tag = await this.tagRepo.create(name, createdBy);
       if (tag.id === 0) {
            return { success: false, status: 503, message: "Failed to create tag", data: null };
       }
       return { success: true, status: 201, message: "Tag created", data: tag };
    }

  public async deleteTag(id: number): Promise<ServiceResult<boolean>> {
        const tag = await this.tagRepo.findById(id);
        if (tag.id === 0) {
            return { success: false, status: 404, message: "Tag not found", data: null };
        }
        const ok = await this.tagRepo.delete(id);
        if (!ok) {
            return { success: false, status: 500, message: "Failed to delete tag", data: null };
        }
      return { success: true, status: 200, message: "Tag deleted", data: true };
    }

}

