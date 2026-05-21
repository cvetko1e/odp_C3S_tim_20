import { AuditLogDto } from "../../DTOs/audit/AuditLogDto";

export interface IAuditService {
  log(
    action: string,
    userId?: number | null,
    entity?: string | null,
    entityId?: number | null,
    meta?: string | null,
    ipAddress?: string | null,
  ): Promise<void>;
  getLogs(page?: number, limit?: number): Promise<AuditLogDto[]>;
}
