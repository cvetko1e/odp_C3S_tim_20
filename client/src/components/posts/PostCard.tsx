import React from "react";
import type { Post } from "../../types/posts/Post";
import { LikeButton } from "./LikeButton";

interface PostCardProps {
  post: Post;
  currentUserId: number;
  isLikedInitially: boolean;
  onLikeToggle: (postId: number) => void;
  onCardClick?: (postId: number) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  isLikedInitially,
  onLikeToggle,
  onCardClick,
}) => {
  // Pravilo iz zadatka: Korisnik ne može lajkovati sopstvenu objavu
  const isOwnPost = post.authorId === currentUserId;

  return (
    <div
      onClick={() => onCardClick && onCardClick(post.id)}
      className={`p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow ${
        onCardClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
        <span className="font-semibold text-gray-700">@{post.authorUsername ?? "korisnik"}</span>
        <span>•</span>
        <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}</span>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {post.content}
      </p>

      {post.imageUrl && (
        <div className="mb-4 overflow-hidden rounded-lg max-h-60 bg-gray-50">
          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 rounded"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
        <LikeButton
          likesCount={post.likesCount}
          isLiked={isLikedInitially}
          onLikeToggle={() => onLikeToggle(post.id)}
          disabled={isOwnPost}
        />
        
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641l-.318 1.235c-.083.323.218.63.534.534l1.235-.318c.601-.154 1.194.154 1.641.586A11.455 11.455 0 0 0 12 20.25Z" />
          </svg>
          <span>{post.commentsCount} komentara</span>
        </div>
      </div>
    </div>
  );
};
