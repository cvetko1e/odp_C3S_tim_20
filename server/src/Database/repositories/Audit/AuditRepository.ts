import { ResultSetHeader, RowDataPacket } from "mysql2";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { IAuditRepository } from "../../../Domain/repositories/Audit/IAuditRepository";
import { AuditLogDto } from "../../../Domain/DTOs/audit/AuditLogDto";

type AuditRow = RowDataPacket & {
  id: number;
  userId: number | null;
  action: string;
  entity: string | null;
  entityId: number | null;
  meta: string | null;
  ipAddress: string | null;
  createdAt: Date | null;
};

export class AuditRepository implements IAuditRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private map(row: AuditRow): AuditLogDto {
    return new AuditLogDto(
      row.id,
      row.userId ?? null,
      row.action,
      row.entity ?? null,
      row.entityId ?? null,
      row.meta ?? null,
      row.ipAddress ?? null,
      row.createdAt ? new Date(row.createdAt).toISOString() : null,
    );
  }

  public async log(
    action: string,
    userId: number | null = null,
    entity: string | null = null,
    entityId: number | null = null,
    meta: string | null = null,
    ipAddress: string | null = null,
  ): Promise<void> {
    const res = await this.db.getWriteConnection();
    if (!res) return;
    try {
      await res.conn.execute<ResultSetHeader>(
        `INSERT INTO audits (userId, action, entity, entityId, meta, ipAddress)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, action, entity, entityId, meta, ipAddress],
      );
    } catch (err) {
      this.logger.error("AuditRepository", "log failed", err);
    } finally {
      res.conn.release();
    }
  }

  public async getAll(limit = 50, offset = 0): Promise<AuditLogDto[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<AuditRow[]>(
        `SELECT a.id, a.userId, a.action, a.entity, a.entityId, a.meta, a.ipAddress, a.createdAt
         FROM audits a
         ORDER BY a.createdAt DESC
         LIMIT ? OFFSET ?`,
        [limit, offset],
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("AuditRepository", "getAll failed", err);
      return [];
    } finally {
      res.conn.release();
    }
  }
}
