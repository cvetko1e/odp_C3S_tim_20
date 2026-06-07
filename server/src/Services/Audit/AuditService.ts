import { IAuditService } from "../../Domain/services/Audit/IAuditService";
import { IAuditRepository } from "../../Domain/repositories/Audit/IAuditRepository";
import { AuditLogDto } from "../../Domain/DTOs/audit/AuditLogDto";

export class AuditService implements IAuditService {
  public constructor(private readonly auditRepo: IAuditRepository) {}

  public async log(
    action: string,
    userId: number | null = null,
    entity: string | null = null,
    entityId: number | null = null,
    meta: string | null = null,
    ipAddress: string | null = null,
  ): Promise<void> {
    await this.auditRepo.log(action, userId, entity, entityId, meta, ipAddress);
  }

  public async getLogs(page = 1, limit = 50): Promise<AuditLogDto[]> {
    const offset = (page - 1) * limit;
    return this.auditRepo.getAll(limit, offset);
  }
}
