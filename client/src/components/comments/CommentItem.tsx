import React, { useState } from "react";
import type { CommentDto } from "../../models/comments/CommentTypes";
import { commentsApi } from "../../api_services/comments/CommentsAPIService";

interface CommentItemProps {
  comment: CommentDto;
  currentUserId: number;
  depth?: number;
  onReplyPosted: () => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  depth = 0,
  onReplyPosted,
}) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likesCount);
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [displayContent, setDisplayContent] = useState(comment.content);
  const [deleted, setDeleted] = useState(comment.isDeleted === 1);
  const [loading, setLoading] = useState(false);

  const isOwn = comment.authorId === currentUserId;
  const isDeleted = deleted || comment.isDeleted === 1;
  const canReply = depth < 1 && !isDeleted;

  const handleLike = async () => {
    if (isDeleted) return;
    if (liked) {
      await commentsApi.unlike(comment.id);
      setLiked(false);
      setLikesCount((c) => c - 1);
    } else {
      await commentsApi.like(comment.id);
      setLiked(true);
      setLikesCount((c) => c + 1);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Obrisati komentar?")) return;
    const res = await commentsApi.remove(comment.id);
    if (res.success) setDeleted(true);
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    setLoading(true);
    const res = await commentsApi.update(comment.id, editContent.trim());
    if (res.success) {
      setDisplayContent(editContent.trim());
      setEditing(false);
    }
    setLoading(false);
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setLoading(true);
    const res = await commentsApi.create(comment.postId, replyContent.trim(), comment.id);
    if (res.success) {
      setReplyContent("");
      setReplying(false);
      onReplyPosted();
    }
    setLoading(false);
  };

  return (
    <div className={`${depth > 0 ? "ml-8 border-l border-white/6 pl-4" : ""}`}>
      <div className="bg-white/3 border border-white/6 rounded-xl p-4 mb-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-white/60">
            @{comment.authorUsername ?? "korisnik"}
          </span>
          <span className="text-xs text-white/25">
            {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ""}
          </span>
        </div>

        {/* Content */}
        {isDeleted ? (
          <p className="text-sm text-white/20 italic">[komentar obrisan]</p>
        ) : editing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-white/20"
              rows={3}
              maxLength={2000}
            />
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                disabled={loading}
                className="px-3 py-1 text-xs font-medium bg-sky-500/20 text-sky-400 border border-sky-500/20 rounded-lg hover:bg-sky-500/30 disabled:opacity-50 transition-colors"
              >
                Sačuvaj
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-1 text-xs text-white/30 hover:text-white/50 transition-colors"
              >
                Otkaži
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/70 whitespace-pre-wrap">{displayContent}</p>
        )}

        {/* Actions */}
        {!isDeleted && !editing && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/6">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-xs transition-colors ${
                liked ? "text-red-400" : "text-white/30 hover:text-white/50"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
              {likesCount}
            </button>

            {canReply && (
              <button
                onClick={() => setReplying((r) => !r)}
                className="text-xs text-white/30 hover:text-white/50 transition-colors"
              >
                Odgovori
              </button>
            )}

            {isOwn && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs text-white/30 hover:text-white/50 transition-colors"
                >
                  Izmeni
                </button>
                <button
                  onClick={handleDelete}
                  className="text-xs text-red-400/50 hover:text-red-400 transition-colors"
                >
                  Obriši
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Reply box */}
      {replying && (
        <div className="ml-8 mb-3 space-y-2">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Napišite odgovor..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-white/20"
            rows={2}
            maxLength={2000}
          />
          <div className="flex gap-2">
            <button
              onClick={handleReply}
              disabled={loading || !replyContent.trim()}
              className="px-3 py-1 text-xs font-medium bg-sky-500/20 text-sky-400 border border-sky-500/20 rounded-lg hover:bg-sky-500/30 disabled:opacity-50 transition-colors"
            >
              Pošalji
            </button>
            <button
              onClick={() => setReplying(false)}
              className="px-3 py-1 text-xs text-white/30 hover:text-white/50 transition-colors"
            >
              Otkaži
            </button>
          </div>
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mb-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              depth={depth + 1}
              onReplyPosted={onReplyPosted}
            />
          ))}
        </div>
      )}
    </div>
  );
};
