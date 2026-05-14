import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { postApi } from "../../api_services/posts/PostAPIService";
import { tagApi } from "../../api_services/tags/TagAPIService";
import { PostForm } from "../../components/posts/PostForm";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { Post } from "../../types/posts/Post";
import type { Tag } from "../../types/tags/Tag";

export const EditPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { token, user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const postId = Number.parseInt(id || "0", 10);

  useEffect(() => {
    if (!postId || !token) return;

    Promise.all([postApi.getPostById(postId, token), tagApi.getAllTags()]).then(([data, tags]) => {
      if (data) {
        if (user && data.authorId !== user.id) {
          alert("Nemate ovlascenje za izmenu ove objave.");
          navigate(-1);
          return;
        }
        setPost(data);
      }

      setAvailableTags(tags);
      setLoading(false);
    });
  }, [postId, token, user, navigate]);

  const handleSubmit = async (data: { title: string; content: string; imageUrl: string | null; tagIds: number[] }) => {
    if (!token || !post) return;

    const success = await postApi.updatePost(token, post.id, data.title, data.content, data.imageUrl);
    if (success) {
      navigate(`/posts/${post.id}`);
    } else {
      alert("Greska prilikom izmene objave.");
    }
  };

  if (loading) return <div className="text-center py-10">Ucitavanje podataka...</div>;
  if (!post) return <div className="text-center py-10 text-red-500">Objava nije pronadjena.</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Izmeni objavu</h1>
      <PostForm
        initialTitle={post.title}
        initialContent={post.content}
        initialImageUrl={post.imageUrl || ""}
        initialTagIds={post.tags?.map((tag) => tag.id) || []}
        availableTags={availableTags}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        submitLabel="Sacuvaj izmene"
      />
    </div>
  );
};
