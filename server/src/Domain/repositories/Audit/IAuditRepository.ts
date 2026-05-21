import { AuditLogDto } from "../../DTOs/audit/AuditLogDto";

export interface IAuditRepository {
  log(
    action: string,
    userId?: number | null,
    entity?: string | null,
    entityId?: number | null,
    meta?: string | null,
    ipAddress?: string | null,
  ): Promise<void>;
  getAll(limit?: number, offset?: number): Promise<AuditLogDto[]>;
}
