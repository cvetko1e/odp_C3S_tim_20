import React, { useCallback, useEffect, useState } from "react";
import { commentsApi } from "../../api_services/comments/CommentsAPIService";
import { CommentItem } from "./CommentItem";
import { Button, Card, Spinner, Empty, ErrorBox, TextArea } from "../ui/UI";
import type { CommentDto } from "../../models/comments/CommentTypes";

interface CommentListProps {
  postId: number;
  currentUserId: number | null;
}

export const CommentList: React.FC<CommentListProps> = ({ postId, currentUserId }) => {
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await commentsApi.getByPost(postId);
    if (res.success && res.data) {
      setComments(res.data);
      setError("");
    } else {
      setError(res.message);
    }
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const handleSubmit = async () => {
    if (!content.trim() || currentUserId === null) return;
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
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
        Komentari ({comments.length})
      </h2>

      {currentUserId !== null ? (
        <Card className="space-y-3 p-4">
          <TextArea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Napisite komentar..."
            rows={3}
            maxLength={2000}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{content.length}/2000</span>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !content.trim()}
              className="gap-2 px-4 py-1.5 text-xs"
            >
              {submitting && <Spinner size={12} />}
              Objavi
            </Button>
          </div>
        </Card>
      ) : (
        <p className="text-sm text-gray-500">Prijavite se da biste komentarisali.</p>
      )}

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
              currentUserId={currentUserId ?? 0}
              depth={0}
              onReplyPosted={load}
            />
          ))}
        </div>
      )}
    </div>
  );
};
