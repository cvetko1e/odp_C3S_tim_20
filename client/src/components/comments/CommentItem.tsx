import React, { useState } from "react";
import type { CommentDto } from "../../models/comments/CommentTypes";
import { commentsApi } from "../../api_services/comments/CommentsAPIService";
import { Button, Card, TextArea } from "../ui/UI";

interface CommentItemProps {
  comment: CommentDto;
  currentUserId: number;
  canFlagComments: boolean;
  depth?: number;
  onReplyPosted: () => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment, currentUserId, canFlagComments, depth = 0, onReplyPosted }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likesCount);
  const [flagged, setFlagged] = useState(comment.isFlagged === 1);
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [displayContent, setDisplayContent] = useState(comment.content);
  const [deleted, setDeleted] = useState(comment.isDeleted === 1);
  const [loading, setLoading] = useState(false);

  const isOwn = comment.authorId === currentUserId;
  const isAuthenticated = currentUserId !== 0;
  const isDeleted = deleted || comment.isDeleted === 1;
  const canReply = isAuthenticated && depth < 1 && !isDeleted;

  const handleLike = async () => {
    if (isDeleted) return;
    if (liked) {
      await commentsApi.unlike(comment.id);
      setLiked(false);
      setLikesCount((count) => count - 1);
    } else {
      await commentsApi.like(comment.id);
      setLiked(true);
      setLikesCount((count) => count + 1);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete comment?")) return;
    const response = await commentsApi.remove(comment.id);
    if (response.success) setDeleted(true);
  };

  const handleFlag = async () => {
    if (!window.confirm("Flag this comment as a rule violation?")) return;
    setLoading(true);
    const response = await commentsApi.flag(comment.id);
    if (response.success) {
      setFlagged(true);
      onReplyPosted();
    }
    setLoading(false);
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    setLoading(true);
    const response = await commentsApi.update(comment.id, editContent.trim());
    if (response.success) {
      setDisplayContent(editContent.trim());
      setEditing(false);
    }
    setLoading(false);
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setLoading(true);
    const response = await commentsApi.create(comment.postId, replyContent.trim(), comment.id);
    if (response.success) {
      setReplyContent("");
      setReplying(false);
      onReplyPosted();
    }
    setLoading(false);
  };

  return (
    <div className={depth > 0 ? "ml-6 border-l border-gray-200 pl-4" : ""}>
      <Card className="mb-2 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-700">@{comment.authorUsername ?? "korisnik"}</span>
          <div className="flex items-center gap-2">
            {flagged && <span className="rounded bg-yellow-100 px-2 py-0.5 text-[11px] font-semibold text-yellow-800">Flagged</span>}
            <span className="text-xs text-gray-400">{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ""}</span>
          </div>
        </div>

        {isDeleted ? (
          <p className="text-sm italic text-gray-400">[comment deleted]</p>
        ) : editing ? (
          <div className="space-y-2">
            <TextArea value={editContent} onChange={(event) => setEditContent(event.target.value)} rows={3} maxLength={2000} />
            <div className="flex gap-2">
              <Button onClick={handleEdit} disabled={loading} className="px-3 py-1 text-xs">Save</Button>
              <Button variant="ghost" onClick={() => setEditing(false)} className="px-3 py-1 text-xs">Cancel</Button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm text-gray-700">{displayContent}</p>
        )}

        {isAuthenticated && !isDeleted && !editing && (
          <div className="mt-3 flex items-center gap-3 border-t border-gray-200 pt-3">
            <button onClick={handleLike} className={`text-xs font-medium ${liked ? "text-red-600" : "text-gray-500 hover:text-gray-900"}`}>
              {liked ? "Unlike" : "Like"} ({likesCount})
            </button>
            {canReply && <button onClick={() => setReplying((value) => !value)} className="text-xs font-medium text-gray-500 hover:text-gray-900">Reply</button>}
            {canFlagComments && !flagged && (
              <button onClick={handleFlag} disabled={loading} className="text-xs font-medium text-yellow-700 hover:text-yellow-800">Flag</button>
            )}
            {isOwn && (
              <>
                <button onClick={() => setEditing(true)} className="text-xs font-medium text-gray-500 hover:text-gray-900">Edit</button>
                <button onClick={handleDelete} className="text-xs font-medium text-red-600 hover:text-red-700">Delete</button>
              </>
            )}
          </div>
        )}
      </Card>

      {replying && (
        <div className="mb-3 ml-6 space-y-2">
          <TextArea value={replyContent} onChange={(event) => setReplyContent(event.target.value)} placeholder="Write a reply..." rows={2} maxLength={2000} />
          <div className="flex gap-2">
            <Button onClick={handleReply} disabled={loading || !replyContent.trim()} className="px-3 py-1 text-xs">Send</Button>
            <Button variant="ghost" onClick={() => setReplying(false)} className="px-3 py-1 text-xs">Cancel</Button>
          </div>
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mb-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              canFlagComments={canFlagComments}
              depth={depth + 1}
              onReplyPosted={onReplyPosted}
            />
          ))}
        </div>
      )}
    </div>
  );
};
