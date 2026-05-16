import { RowDataPacket, ResultSetHeader } from "mysql2";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { ICommentRepository } from "../../../Domain/repositories/Comment/ICommentRepository";
import { CommentDto } from "../../../Domain/DTOs/comments/CommentDto";

type CommentRow = RowDataPacket & {
  id: number;
  postId: number;
  authorId: number;
  parentId: number | null;
  content: string;
  isDeleted: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  authorUsername: string | null;
  likesCount: number;
};

type CountRow = RowDataPacket & { cnt: number };
type DepthRow = RowDataPacket & { parentId: number | null };

export class CommentRepository implements ICommentRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private map(row: CommentRow): CommentDto {
    return new CommentDto(
      row.id,
      row.postId,
      row.authorId,
      row.parentId ?? null,
      // soft-delete: mask content
      row.isDeleted ? "[deleted comment]" : row.content,
      row.isDeleted,
      row.createdAt ? new Date(row.createdAt).toISOString() : null,
      row.updatedAt ? new Date(row.updatedAt).toISOString() : null,
      row.authorUsername ?? null,
      row.likesCount ?? 0,
      []
    );
  }

  public async findByPostId(postId: number): Promise<CommentDto[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<CommentRow[]>(
        `SELECT c.id, c.postId, c.authorId, c.parentId, c.content, c.isDeleted, c.createdAt, c.updatedAt,
                u.username AS authorUsername,
                (SELECT COUNT(*) FROM comment_likes cl WHERE cl.commentId = c.id) AS likesCount
         FROM comments c
         LEFT JOIN users u ON c.authorId = u.id
         WHERE c.postId = ?
         ORDER BY c.createdAt ASC`,
        [postId]
      );

      const all = rows.map((r) => this.map(r));

      // Build tree: root comments carry their replies (max 2 levels)
      const roots: CommentDto[] = [];
      const map = new Map<number, CommentDto>();
      for (const c of all) map.set(c.id, c);

      for (const c of all) {
        if (c.parentId === null) {
          roots.push(c);
        } else {
          const parent = map.get(c.parentId);
          if (parent) parent.replies.push(c);
        }
      }

      return roots;
    } catch (err) {
      this.logger.error("CommentRepository", "findByPostId failed", err);
      return [];
    } finally {
      res.conn.release();
    }
  }

  public async findById(id: number): Promise<CommentDto | null> {
    const res = await this.db.getReadConnection();
    if (!res) return null;
    try {
      const [rows] = await res.conn.execute<CommentRow[]>(
        `SELECT c.id, c.postId, c.authorId, c.parentId, c.content, c.isDeleted, c.createdAt, c.updatedAt,
                u.username AS authorUsername,
                (SELECT COUNT(*) FROM comment_likes cl WHERE cl.commentId = c.id) AS likesCount
         FROM comments c
         LEFT JOIN users u ON c.authorId = u.id
         WHERE c.id = ?`,
        [id]
      );
      return rows.length > 0 ? this.map(rows[0]) : null;
    } catch (err) {
      this.logger.error("CommentRepository", "findById failed", err);
      return null;
    } finally {
      res.conn.release();
    }
  }

  public async create(
    postId: number,
    authorId: number,
    content: string,
    parentId: number | null
  ): Promise<CommentDto | null> {
    const res = await this.db.getWriteConnection();
    if (!res) return null;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO comments (postId, authorId, content, parentId) VALUES (?, ?, ?, ?)`,
        [postId, authorId, content, parentId ?? null]
      );
      if (result.insertId === 0) return null;
      return this.findById(result.insertId);
    } catch (err) {
      this.logger.error("CommentRepository", "create failed", err);
      return null;
    } finally {
      res.conn.release();
    }
  }

  public async update(id: number, content: string): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE comments SET content = ? WHERE id = ? AND isDeleted = 0`,
        [content, id]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("CommentRepository", "update failed", err);
      return false;
    } finally {
      res.conn.release();
    }
  }

  public async softDelete(id: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE comments SET isDeleted = 1 WHERE id = ?`,
        [id]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("CommentRepository", "softDelete failed", err);
      return false;
    } finally {
      res.conn.release();
    }
  }

  public async hasUserLikedComment(commentId: number, userId: number): Promise<boolean> {
    const res = await this.db.getReadConnection();
    if (!res) return false;
    try {
      const [rows] = await res.conn.execute<CountRow[]>(
        `SELECT COUNT(*) AS cnt FROM comment_likes WHERE commentId = ? AND userId = ?`,
        [commentId, userId]
      );
      return (rows[0]?.cnt ?? 0) > 0;
    } catch (err) {
      this.logger.error("CommentRepository", "hasUserLikedComment failed", err);
      return false;
    } finally {
      res.conn.release();
    }
  }

  public async addLike(commentId: number, userId: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT IGNORE INTO comment_likes (commentId, userId) VALUES (?, ?)`,
        [commentId, userId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("CommentRepository", "addLike failed", err);
      return false;
    } finally {
      res.conn.release();
    }
  }

  public async removeLike(commentId: number, userId: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `DELETE FROM comment_likes WHERE commentId = ? AND userId = ?`,
        [commentId, userId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("CommentRepository", "removeLike failed", err);
      return false;
    } finally {
      res.conn.release();
    }
  }

  // Returns 0 for root comment, 1 for direct reply, 2+ for deeper (we block at 1)
  public async getDepth(commentId: number): Promise<number> {
    const res = await this.db.getReadConnection();
    if (!res) return 0;
    try {
      let depth = 0;
      let currentId: number | null = commentId;

      while (currentId !== null) {
        const [rows] = await res.conn.execute<DepthRow[]>(
          `SELECT parentId FROM comments WHERE id = ?`,
          [currentId]
        );
        if (rows.length === 0) break;
        currentId = rows[0].parentId ?? null;
        if (currentId !== null) depth++;
      }

      return depth;
    } catch (err) {
      this.logger.error("CommentRepository", "getDepth failed", err);
      return 0;
    } finally {
      res.conn.release();
    }
  }
}
