import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { postApi } from "../../api_services/posts/PostAPIService";
import { LikeButton } from "../../components/posts/LikeButton";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { Post } from "../../types/posts/Post";

export const PostDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  const postId = Number.parseInt(id || "0", 10);

  useEffect(() => {
    if (!postId || !token) return;

    postApi.getPostById(postId, token).then((data) => {
      setPost(data);
      setIsLiked(false);
      setLoading(false);
    });
  }, [postId, token]);

  const handleLikeToggle = async () => {
    if (!post || !token) return;

    if (isLiked) {
      const success = await postApi.unlikePost(token, post.id);
      if (success) {
        setIsLiked(false);
        setPost((prev) => (prev ? { ...prev, likesCount: prev.likesCount - 1 } : null));
      }
    } else {
      const success = await postApi.likePost(token, post.id);
      if (success) {
        setIsLiked(true);
        setPost((prev) => (prev ? { ...prev, likesCount: prev.likesCount + 1 } : null));
      }
    }
  };

  const handleDelete = async () => {
    if (!post || !token) return;
    if (window.confirm("Da li ste sigurni da zelite da obrisete ovu objavu?")) {
      const success = await postApi.deletePost(token, post.id);
      if (success) {
        navigate(`/communities/${post.communityId}`);
      }
    }
  };

  if (loading) return <div className="text-center py-10">Ucitavanje objave...</div>;
  if (!post) return <div className="text-center py-10 text-red-500">Objava nije pronadjena.</div>;

  const isAuthor = user?.id === post.authorId;
  const canManage = isAuthor || user?.role === "admin";

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
      >
        Nazad
      </button>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs text-gray-500">
            Autor: <span className="font-semibold text-gray-700">@{post.authorUsername}</span>
            {" "}•{" "}
            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}
          </div>

          {canManage && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/posts/edit/${post.id}`)}
                className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded"
              >
                Izmeni
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded"
              >
                Obrisi
              </button>
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>

        {post.imageUrl && (
          <div className="mb-6 rounded-lg overflow-hidden max-h-96 bg-gray-50">
            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="prose max-w-none text-gray-700 mb-6 whitespace-pre-wrap font-sans">{post.content}</div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {post.tags.map((tag) => (
              <span key={tag.id} className="px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 rounded">
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-gray-100 flex items-center gap-4">
          <LikeButton
            likesCount={post.likesCount}
            isLiked={isLiked}
            onLikeToggle={handleLikeToggle}
            disabled={isAuthor}
          />
        </div>
      </div>
    </div>
  );
};
