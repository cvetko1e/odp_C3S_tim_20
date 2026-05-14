import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { postApi } from "../../api_services/posts/PostAPIService";
import { tagApi } from "../../api_services/tags/TagAPIService";
import { PostForm } from "../../components/posts/PostForm";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { Tag } from "../../types/tags/Tag";

export const CreatePostPage: React.FC = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      const data = await tagApi.getAllTags();
      setTags(data);
      setLoading(false);
    };

    fetchTags();
  }, []);

  const handleSubmit = async (data: { title: string; content: string; imageUrl: string | null; tagIds: number[] }) => {
    if (!token || !communityId) return;

    const parsedCommunityId = Number.parseInt(communityId, 10);
    if (!Number.isInteger(parsedCommunityId) || parsedCommunityId <= 0) {
      alert("Neispravan communityId.");
      return;
    }

    const newPost = await postApi.createPost(
      token,
      data.title,
      data.content,
      data.imageUrl,
      parsedCommunityId,
      data.tagIds
    );

    if (newPost) {
      navigate(`/posts/${newPost.id}`);
    } else {
      alert("Greska prilikom kreiranja objave.");
    }
  };

  if (loading) return <div className="text-center py-10">Ucitavanje...</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Kreiraj novu objavu</h1>
      <PostForm
        availableTags={tags}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        submitLabel="Objavi"
      />
    </div>
  );
};
