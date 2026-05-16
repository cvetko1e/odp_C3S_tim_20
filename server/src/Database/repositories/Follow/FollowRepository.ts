import { RowDataPacket, ResultSetHeader } from "mysql2";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { IFollowRepository } from "../../../Domain/repositories/Follow/IFollowRepository";
import { UserDto } from "../../../Domain/DTOs/users/UserDto";

type CountRow = RowDataPacket & { cnt: number };

// Reuse whatever shape UserDto needs — adjust fields to match your existing UserDto constructor
type UserRow = RowDataPacket & {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: number;
  followersCount: number;
  followingCount: number;
};

export class FollowRepository implements IFollowRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private mapUser(row: UserRow): UserDto {
    // Adjust constructor args to match your existing UserDto
    return new UserDto(
      row.id,
      row.username,
      row.email,
      row.role,
      row.isActive,
      row.followersCount,
      row.followingCount,
    );
  }

  public async follow(followerId: number, followingId: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT IGNORE INTO user_follows (followerId, followingId) VALUES (?, ?)`,
        [followerId, followingId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("FollowRepository", "follow failed", err);
      return false;
    } finally {
      res.conn.release();
    }
  }

  public async unfollow(followerId: number, followingId: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `DELETE FROM user_follows WHERE followerId = ? AND followingId = ?`,
        [followerId, followingId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("FollowRepository", "unfollow failed", err);
      return false;
    } finally {
      res.conn.release();
    }
  }

  public async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const res = await this.db.getReadConnection();
    if (!res) return false;
    try {
      const [rows] = await res.conn.execute<CountRow[]>(
        `SELECT COUNT(*) AS cnt FROM user_follows WHERE followerId = ? AND followingId = ?`,
        [followerId, followingId]
      );
      return (rows[0]?.cnt ?? 0) > 0;
    } catch (err) {
      this.logger.error("FollowRepository", "isFollowing failed", err);
      return false;
    } finally {
      res.conn.release();
    }
  }

  public async getFollowers(userId: number): Promise<UserDto[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<UserRow[]>(
        `SELECT u.id, u.username, u.email, u.role, u.isActive,
                (SELECT COUNT(*) FROM user_follows WHERE followingId = u.id) AS followersCount,
                (SELECT COUNT(*) FROM user_follows WHERE followerId  = u.id) AS followingCount
         FROM users u
         INNER JOIN user_follows uf ON uf.followerId = u.id
         WHERE uf.followingId = ?
         ORDER BY uf.followedAt DESC`,
        [userId]
      );
      return rows.map((r) => this.mapUser(r));
    } catch (err) {
      this.logger.error("FollowRepository", "getFollowers failed", err);
      return [];
    } finally {
      res.conn.release();
    }
  }

  public async getFollowing(userId: number): Promise<UserDto[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<UserRow[]>(
        `SELECT u.id, u.username, u.email, u.role, u.isActive,
                (SELECT COUNT(*) FROM user_follows WHERE followingId = u.id) AS followersCount,
                (SELECT COUNT(*) FROM user_follows WHERE followerId  = u.id) AS followingCount
         FROM users u
         INNER JOIN user_follows uf ON uf.followingId = u.id
         WHERE uf.followerId = ?
         ORDER BY uf.followedAt DESC`,
        [userId]
      );
      return rows.map((r) => this.mapUser(r));
    } catch (err) {
      this.logger.error("FollowRepository", "getFollowing failed", err);
      return [];
    } finally {
      res.conn.release();
    }
  }

  public async getFollowerCount(userId: number): Promise<number> {
    const res = await this.db.getReadConnection();
    if (!res) return 0;
    try {
      const [rows] = await res.conn.execute<CountRow[]>(
        `SELECT COUNT(*) AS cnt FROM user_follows WHERE followingId = ?`,
        [userId]
      );
      return rows[0]?.cnt ?? 0;
    } catch (err) {
      this.logger.error("FollowRepository", "getFollowerCount failed", err);
      return 0;
    } finally {
      res.conn.release();
    }
  }

  public async getFollowingCount(userId: number): Promise<number> {
    const res = await this.db.getReadConnection();
    if (!res) return 0;
    try {
      const [rows] = await res.conn.execute<CountRow[]>(
        `SELECT COUNT(*) AS cnt FROM user_follows WHERE followerId = ?`,
        [userId]
      );
      return rows[0]?.cnt ?? 0;
    } catch (err) {
      this.logger.error("FollowRepository", "getFollowingCount failed", err);
      return 0;
    } finally {
      res.conn.release();
    }
  }

  public async searchUsers(query: string, requesterId: number): Promise<UserDto[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const like = `%${query}%`;
      const [rows] = await res.conn.execute<UserRow[]>(
        `SELECT u.id, u.username, u.email, u.role, u.isActive,
                (SELECT COUNT(*) FROM user_follows WHERE followingId = u.id) AS followersCount,
                (SELECT COUNT(*) FROM user_follows WHERE followerId  = u.id) AS followingCount
         FROM users u
         WHERE (u.username LIKE ? OR u.email LIKE ?)
           AND u.id != ?
           AND u.isActive = 1
         ORDER BY u.username ASC
         LIMIT 20`,
        [like, like, requesterId]
      );
      return rows.map((r) => this.mapUser(r));
    } catch (err) {
      this.logger.error("FollowRepository", "searchUsers failed", err);
      return [];
    } finally {
      res.conn.release();
    }
  }
}
