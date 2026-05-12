import { RowDataPacket, ResultSetHeader } from "mysql2";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { ICommunityRepository } from "../../../Domain/repositories/communities/ICommunityRepository";
import { CommunityType } from "../../../Domain/models/Community";
import { CommunityDto, CommunityMemberRole, CommunityMemberStatus } from "../../../Domain/DTOs/communities/CommunityDto";
import { CreateCommunityDto } from "../../../Domain/DTOs/communities/CreateCommunityDto";
import { UpdateCommunityDto } from "../../../Domain/DTOs/communities/UpdateCommunityDto";

type CommunityRow = RowDataPacket & {
  id: number;
  name: string;
  description: string | null;
  rules: string | null;
  avatarUrl: string | null;
  type: CommunityType;
  createdBy: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  memberRole?: CommunityMemberRole | null;
  memberStatus?: CommunityMemberStatus | null;
};

type CountRow = RowDataPacket & { cnt: number };

type CommunityTypeRow = RowDataPacket & { type: CommunityType };

export class CommunityRepository implements ICommunityRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private map(row: CommunityRow): CommunityDto {
    return new CommunityDto(
      row.id,
      row.name,
      row.description,
      row.rules,
      row.avatarUrl,
      row.type,
      row.createdBy,
      row.createdAt ? new Date(row.createdAt).toISOString() : null,
      row.updatedAt ? new Date(row.updatedAt).toISOString() : null,
      row.memberRole ?? null,
      row.memberStatus ?? null,
    );
  }

  public async getPublic(): Promise<CommunityDto[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<CommunityRow[]>(
        `SELECT id, name, description, rules, avatarUrl, type, createdBy, createdAt, updatedAt
         FROM communities
         WHERE type = ?
         ORDER BY id DESC`,
        ["public"],
      );
      return rows.map((row) => this.map(row));
    } catch (err) {
      this.logger.error("CommunityRepository", "getPublic failed", err);
      return [];
    } finally {
      res.conn.release();
    }
  }

  public async getAll(): Promise<CommunityDto[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<CommunityRow[]>(
        `SELECT id, name, description, rules, avatarUrl, type, createdBy, createdAt, updatedAt
         FROM communities
         ORDER BY id DESC`,
      );
      return rows.map((row) => this.map(row));
    } catch (err) {
      this.logger.error("CommunityRepository", "getAll failed", err);
      return [];
    } finally {
      res.conn.release();
    }
  }

  public async getById(id: number): Promise<CommunityDto | null> {
    const res = await this.db.getReadConnection();
    if (!res) return null;
    try {
      const [rows] = await res.conn.execute<CommunityRow[]>(
        `SELECT id, name, description, rules, avatarUrl, type, createdBy, createdAt, updatedAt
         FROM communities
         WHERE id = ?`,
        [id],
      );
      return rows.length > 0 ? this.map(rows[0]) : null;
    } catch (err) {
      this.logger.error("CommunityRepository", "getById failed", err);
      return null;
    } finally {
      res.conn.release();
    }
  }

  public async getByUserId(userId: number): Promise<CommunityDto[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<CommunityRow[]>(
        `SELECT c.id, c.name, c.description, c.rules, c.avatarUrl, c.type, c.createdBy, c.createdAt, c.updatedAt,
                cm.role AS memberRole, cm.status AS memberStatus
         FROM communities c
         INNER JOIN community_members cm ON cm.communityId = c.id
         WHERE cm.userId = ?
         ORDER BY c.id DESC`,
        [userId],
      );
      return rows.map((row) => this.map(row));
    } catch (err) {
      this.logger.error("CommunityRepository", "getByUserId failed", err);
      return [];
    } finally {
      res.conn.release();
    }
  }

  public async create(dto: CreateCommunityDto, createdBy: number): Promise<CommunityDto | null> {
    const res = await this.db.getWriteConnection();
    if (!res) return null;
    try {
      await res.conn.beginTransaction();
      const [communityResult] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO communities (name, description, rules, avatarUrl, type, createdBy)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [dto.name, dto.description, dto.rules, dto.avatarUrl, dto.type, createdBy],
      );

      if (communityResult.insertId === 0) {
        await res.conn.rollback();
        return null;
      }

      const [memberResult] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO community_members (communityId, userId, role, status)
         VALUES (?, ?, ?, ?)`,
        [communityResult.insertId, createdBy, "moderator", "active"],
      );

      if (memberResult.affectedRows === 0) {
        await res.conn.rollback();
        return null;
      }

      await res.conn.commit();

      const [rows] = await res.conn.execute<CommunityRow[]>(
        `SELECT id, name, description, rules, avatarUrl, type, createdBy, createdAt, updatedAt
         FROM communities
         WHERE id = ?`,
        [communityResult.insertId],
      );

      return rows.length > 0 ? this.map(rows[0]) : null;
    } catch (err) {
      await res.conn.rollback();
      this.logger.error("CommunityRepository", "create failed", err);
      return null;
    } finally {
      res.conn.release();
    }
  }

  public async update(id: number, dto: UpdateCommunityDto): Promise<boolean> {
    const entries: Array<[string, string | null]> = [];
    if (dto.name !== undefined) entries.push(["name", dto.name]);
    if (dto.description !== undefined) entries.push(["description", dto.description]);
    if (dto.rules !== undefined) entries.push(["rules", dto.rules]);
    if (dto.avatarUrl !== undefined) entries.push(["avatarUrl", dto.avatarUrl]);
    if (dto.type !== undefined) entries.push(["type", dto.type]);

    if (entries.length === 0) return false;

    const setClause = entries.map(([column]) => `${column} = ?`).join(", ");
    const values: Array<string | null | number> = entries.map(([, value]) => value);
    values.push(id);

    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE communities SET ${setClause} WHERE id = ?`,
        values,
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("CommunityRepository", "update failed", err);
      return false;
    } finally {
      res.conn.release();
    }
  }

  public async delete(id: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(`DELETE FROM communities WHERE id = ?`, [id]);
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("CommunityRepository", "delete failed", err);
      return false;
    } finally {
      res.conn.release();
    }
  }

  public async isMember(communityId: number, userId: number): Promise<boolean> {
    const res = await this.db.getReadConnection();
    if (!res) return false;
    try {
      const [rows] = await res.conn.execute<CountRow[]>(
        `SELECT COUNT(*) AS cnt
         FROM community_members
         WHERE communityId = ? AND userId = ?`,
        [communityId, userId],
      );
      return (rows[0]?.cnt ?? 0) > 0;
    } catch (err) {
      this.logger.error("CommunityRepository", "isMember failed", err);
      return false;
    } finally {
      res.conn.release();
    }
  }

  public async isModerator(communityId: number, userId: number): Promise<boolean> {
    const res = await this.db.getReadConnection();
    if (!res) return false;
    try {
      const [rows] = await res.conn.execute<CountRow[]>(
        `SELECT COUNT(*) AS cnt
         FROM community_members
         WHERE communityId = ? AND userId = ? AND role = ? AND status = ?`,
        [communityId, userId, "moderator", "active"],
      );
      return (rows[0]?.cnt ?? 0) > 0;
    } catch (err) {
      this.logger.error("CommunityRepository", "isModerator failed", err);
      return false;
    } finally {
      res.conn.release();
    }
  }

  public async joinCommunity(communityId: number, userId: number): Promise<boolean> {
    const type = await this.getCommunityType(communityId);
    if (!type) return false;

    const alreadyMember = await this.isMember(communityId, userId);
    if (alreadyMember) return false;

    const memberStatus: CommunityMemberStatus = type === "public" ? "active" : "pending";

    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO community_members (communityId, userId, role, status)
         VALUES (?, ?, ?, ?)`,
        [communityId, userId, "member", memberStatus],
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("CommunityRepository", "joinCommunity failed", err);
      return false;
    } finally {
      res.conn.release();
    }
  }

  public async leaveCommunity(communityId: number, userId: number): Promise<boolean> {
    const moderator = await this.isModerator(communityId, userId);
    if (moderator) return false;

    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `DELETE FROM community_members WHERE communityId = ? AND userId = ?`,
        [communityId, userId],
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("CommunityRepository", "leaveCommunity failed", err);
      return false;
    } finally {
      res.conn.release();
    }
  }

  public async getCommunityType(communityId: number): Promise<CommunityType | null> {
    const res = await this.db.getReadConnection();
    if (!res) return null;
    try {
      const [rows] = await res.conn.execute<CommunityTypeRow[]>(
        `SELECT type FROM communities WHERE id = ?`,
        [communityId],
      );
      return rows.length > 0 ? rows[0].type : null;
    } catch (err) {
      this.logger.error("CommunityRepository", "getCommunityType failed", err);
      return null;
    } finally {
      res.conn.release();
    }
  }
}
