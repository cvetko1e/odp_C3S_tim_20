import React, { useEffect, useState } from "react";
import { commentsApi } from "../../api_services/comments/CommentsAPIService";
import { CommentItem } from "./CommentItem";
import { Spinner, Empty, ErrorBox } from "../ui/UI";
import type { CommentDto } from "../../models/comments/CommentTypes";

interface CommentListProps {
  postId: number;
  currentUserId: number;
}

export const CommentList: React.FC<CommentListProps> = ({ postId, currentUserId }) => {
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await commentsApi.getByPost(postId);
    if (res.success && res.data) {
      setComments(res.data);
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [postId]);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    const res = await commentsApi.create(postId, content.trim(), null);
    if (res.success) {
      setContent("");
      await load();
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-mono uppercase tracking-widest text-white/25">
        Komentari ({comments.length})
      </h2>

      {/* New comment box */}
      <div className="bg-white/3 border border-white/6 rounded-xl p-4 space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Napišite komentar..."
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-white/20"
          rows={3}
          maxLength={2000}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/20">{content.length}/2000</span>
          <button
            onClick={handleSubmit}
            disabled={submitting || !content.trim()}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-medium bg-sky-500/20 text-sky-400 border border-sky-500/20 rounded-lg hover:bg-sky-500/30 disabled:opacity-50 transition-colors"
          >
            {submitting && <Spinner size={12} />}
            Objavi
          </button>
        </div>
      </div>

      {error && <ErrorBox message={error} />}

      {loading ? (
        <div className="flex justify-center py-8"><Spinner size={24} /></div>
      ) : comments.length === 0 ? (
        <Empty message="Nema komentara. Budite prvi!" />
      ) : (
        <div className="space-y-2">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              depth={0}
              onReplyPosted={load}
            />
          ))}
        </div>
      )}
    </div>
  );
};
