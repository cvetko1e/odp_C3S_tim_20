import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
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

type ParentRow = RowDataPacket & { parentId: number | null };
type CountRow = RowDataPacket & { cnt: number };

export class CommentRepository implements ICommentRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private mapRow(row: CommentRow): CommentDto {
    return new CommentDto(
      row.id,
      row.postId,
      row.authorId,
      row.parentId,
      row.content,
      row.isDeleted,
      row.createdAt ? new Date(row.createdAt).toISOString() : null,
      row.updatedAt ? new Date(row.updatedAt).toISOString() : null,
      row.authorUsername,
      row.likesCount ?? 0,
      [],
    );
  }

  private async findByIdWithConnection(id: number, conn: PoolConnection): Promise<CommentDto | null> {
    const [rows] = await conn.execute<CommentRow[]>(
      `SELECT c.id, c.postId, c.authorId, c.parentId,
              CASE WHEN c.isDeleted = 1 THEN '[comment deleted]' ELSE c.content END AS content,
              c.isDeleted, c.createdAt, c.updatedAt,
              u.username AS authorUsername,
              (SELECT COUNT(*) FROM comment_likes WHERE commentId = c.id) AS likesCount
       FROM comments c
       LEFT JOIN users u ON u.id = c.authorId
       WHERE c.id = ?`,
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    return this.mapRow(rows[0]);
  }

  public async findByPostId(postId: number): Promise<CommentDto[]> {
    const read = await this.db.getReadConnection();
    if (!read) {
      return [];
    }

    try {
      const [rows] = await read.conn.execute<CommentRow[]>(
        `SELECT c.id, c.postId, c.authorId, c.parentId,
                CASE WHEN c.isDeleted = 1 THEN '[comment deleted]' ELSE c.content END AS content,
                c.isDeleted, c.createdAt, c.updatedAt,
                u.username AS authorUsername,
                (SELECT COUNT(*) FROM comment_likes WHERE commentId = c.id) AS likesCount
         FROM comments c
         LEFT JOIN users u ON u.id = c.authorId
         WHERE c.postId = ?
         ORDER BY c.createdAt ASC`,
        [postId],
      );

      const allComments = rows.map((row) => this.mapRow(row));
      const byId = new Map<number, CommentDto>();
      const roots: CommentDto[] = [];

      for (const comment of allComments) {
        byId.set(comment.id, comment);
      }

      for (const comment of allComments) {
        if (comment.parentId === null) {
          roots.push(comment);
          continue;
        }

        const parent = byId.get(comment.parentId);
        if (parent) {
          parent.replies.push(comment);
        } else {
          roots.push(comment);
        }
      }

      return roots;
    } catch (error) {
      this.logger.error("CommentRepository", "findByPostId failed", error);
      return [];
    } finally {
      read.conn.release();
    }
  }

  public async findById(id: number): Promise<CommentDto | null> {
    const read = await this.db.getReadConnection();
    if (!read) {
      return null;
    }

    try {
      return await this.findByIdWithConnection(id, read.conn);
    } catch (error) {
      this.logger.error("CommentRepository", "findById failed", error);
      return null;
    } finally {
      read.conn.release();
    }
  }

  public async create(postId: number, authorId: number, content: string, parentId: number | null): Promise<CommentDto | null> {
    const write = await this.db.getWriteConnection();
    if (!write) {
      return null;
    }

    try {
      const [result] = await write.conn.execute<ResultSetHeader>(
        `INSERT INTO comments (postId, authorId, parentId, content)
         VALUES (?, ?, ?, ?)`,
        [postId, authorId, parentId, content],
      );

      if (result.insertId <= 0) {
        return null;
      }

      return await this.findByIdWithConnection(result.insertId, write.conn);
    } catch (error) {
      this.logger.error("CommentRepository", "create failed", error);
      return null;
    } finally {
      write.conn.release();
    }
  }

  public async update(id: number, content: string): Promise<boolean> {
    const write = await this.db.getWriteConnection();
    if (!write) {
      return false;
    }

    try {
      const [result] = await write.conn.execute<ResultSetHeader>(
        `UPDATE comments
         SET content = ?, updatedAt = CURRENT_TIMESTAMP
         WHERE id = ? AND isDeleted = 0`,
        [content, id],
      );
      return result.affectedRows > 0;
    } catch (error) {
      this.logger.error("CommentRepository", "update failed", error);
      return false;
    } finally {
      write.conn.release();
    }
  }

  public async softDelete(id: number): Promise<boolean> {
    const write = await this.db.getWriteConnection();
    if (!write) {
      return false;
    }

    try {
      const [result] = await write.conn.execute<ResultSetHeader>(
        `UPDATE comments
         SET isDeleted = 1, content = '[comment deleted]', updatedAt = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [id],
      );
      return result.affectedRows > 0;
    } catch (error) {
      this.logger.error("CommentRepository", "softDelete failed", error);
      return false;
    } finally {
      write.conn.release();
    }
  }

  public async hasUserLikedComment(commentId: number, userId: number): Promise<boolean> {
    const read = await this.db.getReadConnection();
    if (!read) {
      return false;
    }

    try {
      const [rows] = await read.conn.execute<CountRow[]>(
        `SELECT COUNT(*) AS cnt
         FROM comment_likes
         WHERE commentId = ? AND userId = ?`,
        [commentId, userId],
      );
      return (rows[0]?.cnt ?? 0) > 0;
    } catch (error) {
      this.logger.error("CommentRepository", "hasUserLikedComment failed", error);
      return false;
    } finally {
      read.conn.release();
    }
  }

  public async addLike(commentId: number, userId: number): Promise<boolean> {
    const write = await this.db.getWriteConnection();
    if (!write) {
      return false;
    }

    try {
      const [result] = await write.conn.execute<ResultSetHeader>(
        `INSERT IGNORE INTO comment_likes (commentId, userId)
         VALUES (?, ?)`,
        [commentId, userId],
      );
      return result.affectedRows > 0;
    } catch (error) {
      this.logger.error("CommentRepository", "addLike failed", error);
      return false;
    } finally {
      write.conn.release();
    }
  }

  public async removeLike(commentId: number, userId: number): Promise<boolean> {
    const write = await this.db.getWriteConnection();
    if (!write) {
      return false;
    }

    try {
      const [result] = await write.conn.execute<ResultSetHeader>(
        `DELETE FROM comment_likes
         WHERE commentId = ? AND userId = ?`,
        [commentId, userId],
      );
      return result.affectedRows > 0;
    } catch (error) {
      this.logger.error("CommentRepository", "removeLike failed", error);
      return false;
    } finally {
      write.conn.release();
    }
  }

  public async getDepth(commentId: number): Promise<number> {
    const read = await this.db.getReadConnection();
    if (!read) {
      return 0;
    }

    try {
      let depth = 0;
      let currentCommentId: number | null = commentId;

      while (currentCommentId !== null && depth < 10) {
        const result = await read.conn.execute<ParentRow[]>(
          `SELECT parentId FROM comments WHERE id = ?`,
          [currentCommentId],
        );
        const rows: ParentRow[] = result[0];

        if (rows.length === 0) {
          break;
        }

        const parentId: number | null = rows[0].parentId;
        if (parentId === null) {
          break;
        }

        depth += 1;
        currentCommentId = parentId;
      }

      return depth;
    } catch (error) {
      this.logger.error("CommentRepository", "getDepth failed", error);
      return 0;
    } finally {
      read.conn.release();
    }
  }
}
