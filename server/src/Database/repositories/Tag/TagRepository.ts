import { RowDataPacket, ResultSetHeader } from "mysql2";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { ITagRepository } from "../../../Domain/repositories/Tag/ITagRepository";
import { Tag } from "../../../Domain/models/Tag";

type TagRow = RowDataPacket & {
  id: number;
  name: string;
};

export class TagRepository implements ITagRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private map(row: TagRow): Tag {
    return new Tag(row.id, row.name);
  }

  public async findAll(): Promise<Tag[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<TagRow[]>(
        `SELECT id, name FROM tags ORDER BY name ASC`
      );
      return rows.map((row) => this.map(row));
    } catch (err) {
      this.logger.error("TagRepository", "findAll failed", err);
      return [];
    } finally {
      res.conn.release();
    }
  }

  public async findById(id: number): Promise<Tag | null> {
    const res = await this.db.getReadConnection();
    if (!res) return null;
    try {
      const [rows] = await res.conn.execute<TagRow[]>(
        `SELECT id, name FROM tags WHERE id = ?`,
        [id]
      );
      return rows.length > 0 ? this.map(rows[0]) : null;
    } catch (err) {
      this.logger.error("TagRepository", "findById failed", err);
      return null;
    } finally {
      res.conn.release();
    }
  }

  public async findByName(name: string): Promise<Tag | null> {
    const res = await this.db.getReadConnection();
    if (!res) return null;
    try {
      const [rows] = await res.conn.execute<TagRow[]>(
        `SELECT id, name FROM tags WHERE name = ?`,
        [name]
      );
      return rows.length > 0 ? this.map(rows[0]) : null;
    } catch (err) {
      this.logger.error("TagRepository", "findByName failed", err);
      return null;
    } finally {
      res.conn.release();
    }
  }

  public async create(name: string): Promise<Tag> {
    const res = await this.db.getWriteConnection();
    if (!res) throw new Error("Database connection unavailable");
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO tags (name) VALUES (?)`,
        [name]
      );
      return new Tag(result.insertId, name);
    } catch (err) {
      this.logger.error("TagRepository", "create failed", err);
      throw err;
    } finally {
      res.conn.release();
    }
  }

  public async delete(id: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `DELETE FROM tags WHERE id = ?`,
        [id]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("TagRepository", "delete failed", err);
      return false;
    } finally {
      res.conn.release();
    }
  }
}
