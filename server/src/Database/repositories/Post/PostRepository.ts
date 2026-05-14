import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { IPostRepository } from "../../../Domain/repositories/Post/IPostRepository";
import { Post } from "../../../Domain/models/Post";
import { Tag } from "../../../Domain/models/Tag";
import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";

type PostRow = RowDataPacket & {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  authorId: number;
  communityId: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  authorUsername?: string | null;
  likesCount?: number;
  commentsCount?: number;
};

type CountRow = RowDataPacket & { cnt: number };
type PostTagRow = RowDataPacket & { id: number; name: string; postId: number };

export class PostRepository implements IPostRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private map(row: PostRow): Post {
    return new Post(
      row.id,
      row.title,
      row.content,
      row.imageUrl ?? null,
      row.authorId,
      row.communityId,
      row.createdAt ? new Date(row.createdAt) : null,
      row.updatedAt ? new Date(row.updatedAt) : null,
      row.authorUsername ?? null,
      row.likesCount ?? 0,
      row.commentsCount ?? 0,
      []
    );
  }

  private async populateTagsForPosts(posts: Post[], conn: PoolConnection): Promise<void> {
    if (posts.length === 0) return;

    const postIds = posts.map((post) => post.id);
    const placeholders = postIds.map(() => "?").join(", ");

    const [tagRows] = await conn.execute<PostTagRow[]>(
      `SELECT t.id, t.name, pt.postId
       FROM tags t
       INNER JOIN post_tags pt ON pt.tagId = t.id
       WHERE pt.postId IN (${placeholders})`,
      postIds
    );

    posts.forEach((post) => {
      const postTags = tagRows
        .filter((row) => row.postId === post.id)
        .map((row) => new Tag(row.id, row.name));
      post.tags = postTags;
    });
  }

  public async findById(id: number): Promise<Post | null> {
    const res = await this.db.getReadConnection();
    if (!res) return null;
    try {
      const [rows] = await res.conn.execute<PostRow[]>(
        `SELECT p.id, p.title, p.content, p.mediaUrl AS imageUrl, p.authorId, p.communityId, p.createdAt, p.updatedAt,
                u.username AS authorUsername,
                (SELECT COUNT(*) FROM post_likes WHERE postId = p.id) AS likesCount,
                (SELECT COUNT(*) FROM comments WHERE postId = p.id) AS commentsCount
         FROM posts p
         LEFT JOIN users u ON p.authorId = u.id
         WHERE p.id = ?`,
        [id]
      );
      if (rows.length === 0) return null;
      const post = this.map(rows[0]);
      await this.populateTagsForPosts([post], res.conn);
      return post;
    } catch {
      this.logger.error("PostRepository", "findById failed");
      return null;
    } finally {
      res.conn.release();
    }
  }

  public async findByCommunityId(communityId: number): Promise<Post[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<PostRow[]>(
        `SELECT p.id, p.title, p.content, p.mediaUrl AS imageUrl, p.authorId, p.communityId, p.createdAt, p.updatedAt,
                u.username AS authorUsername,
                (SELECT COUNT(*) FROM post_likes WHERE postId = p.id) AS likesCount,
                (SELECT COUNT(*) FROM comments WHERE postId = p.id) AS commentsCount
         FROM posts p
         LEFT JOIN users u ON p.authorId = u.id
         WHERE p.communityId = ?
         ORDER BY p.id DESC`,
        [communityId]
      );
      const posts = rows.map((row) => this.map(row));
      await this.populateTagsForPosts(posts, res.conn);
      return posts;
    } catch {
      this.logger.error("PostRepository", "findByCommunityId failed");
      return [];
    } finally {
      res.conn.release();
    }
  }

  public async getFeed(userId: number): Promise<Post[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<PostRow[]>(
        `SELECT DISTINCT p.id, p.title, p.content, p.mediaUrl AS imageUrl, p.authorId, p.communityId, p.createdAt, p.updatedAt,
                u.username AS authorUsername,
                (SELECT COUNT(*) FROM post_likes WHERE postId = p.id) AS likesCount,
                (SELECT COUNT(*) FROM comments WHERE postId = p.id) AS commentsCount
         FROM posts p
         LEFT JOIN users u ON p.authorId = u.id
         WHERE p.communityId IN (SELECT communityId FROM community_members WHERE userId = ? AND status = 'active')
            OR p.authorId IN (SELECT followingId FROM user_follows WHERE followerId = ?)
         ORDER BY p.id DESC`,
        [userId, userId]
      );
      const posts = rows.map((row) => this.map(row));
      await this.populateTagsForPosts(posts, res.conn);
      return posts;
    } catch {
      this.logger.error("PostRepository", "getFeed failed");
      return [];
    } finally {
      res.conn.release();
    }
  }

  public async create(post: Post): Promise<number | null> {
    const res = await this.db.getWriteConnection();
    if (!res) return null;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO posts (communityId, authorId, title, content, mediaUrl)
         VALUES (?, ?, ?, ?, ?)`,
        [post.communityId, post.authorId, post.title, post.content, post.imageUrl]
      );
      return result.insertId;
    } catch {
      this.logger.error("PostRepository", "create failed");
      return null;
    } finally {
      res.conn.release();
    }
  }

  public async update(post: Post): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE posts SET title = ?, content = ?, mediaUrl = ? WHERE id = ?`,
        [post.title, post.content, post.imageUrl, post.id]
      );
      return result.affectedRows > 0;
    } catch {
      this.logger.error("PostRepository", "update failed");
      return false;
    } finally {
      res.conn.release();
    }
  }

  public async delete(id: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(`DELETE FROM posts WHERE id = ?`, [id]);
      return result.affectedRows > 0;
    } catch {
      this.logger.error("PostRepository", "delete failed");
      return false;
    } finally {
      res.conn.release();
    }
  }

  public async addTagToPost(postId: number, tagId: number): Promise<void> {
    const res = await this.db.getWriteConnection();
    if (!res) return;
    try {
      await res.conn.execute(`INSERT IGNORE INTO post_tags (postId, tagId) VALUES (?, ?)`, [postId, tagId]);
    } catch {
      this.logger.error("PostRepository", "addTagToPost failed");
    } finally {
      res.conn.release();
    }
  }

  public async removeTagsFromPost(postId: number): Promise<void> {
    const res = await this.db.getWriteConnection();
    if (!res) return;
    try {
      await res.conn.execute(`DELETE FROM post_tags WHERE postId = ?`, [postId]);
    } catch {
      this.logger.error("PostRepository", "removeTagsFromPost failed");
    } finally {
      res.conn.release();
    }
  }

  public async hasUserLikedPost(postId: number, userId: number): Promise<boolean> {
    const res = await this.db.getReadConnection();
    if (!res) return false;
    try {
      const [rows] = await res.conn.execute<CountRow[]>(
        `SELECT COUNT(*) AS cnt FROM post_likes WHERE postId = ? AND userId = ?`,
        [postId, userId]
      );
      return (rows[0]?.cnt ?? 0) > 0;
    } catch {
      this.logger.error("PostRepository", "hasUserLikedPost failed");
      return false;
    } finally {
      res.conn.release();
    }
  }

  public async addLike(postId: number, userId: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT IGNORE INTO post_likes (postId, userId) VALUES (?, ?)`,
        [postId, userId]
      );
      return result.affectedRows > 0;
    } catch {
      this.logger.error("PostRepository", "addLike failed");
      return false;
    } finally {
      res.conn.release();
    }
  }

  public async removeLike(postId: number, userId: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `DELETE FROM post_likes WHERE postId = ? AND userId = ?`,
        [postId, userId]
      );
      return result.affectedRows > 0;
    } catch {
      this.logger.error("PostRepository", "removeLike failed");
      return false;
    } finally {
      res.conn.release();
    }
  }
}
