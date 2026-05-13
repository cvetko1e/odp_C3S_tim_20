import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { postApi } from "../../api_services/posts/PostAPIService";
import { PostForm } from "../../components/posts/PostForm";

import type { Tag } from "../../types/tags/Tag";
import axios from "axios";
import AuthContext from "../../contexts/auth/AuthContext";


export const CreatePostPage: React.FC = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const auth = useContext(AuthContext) as { token?: string };
  const token = auth?.token;
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        // Preuzimamo sve tagove sa backend-a
        const response = await axios.get(`${import.meta.env.VITE_API_URL}tags`);
        setTags(response.data);
      } catch {
        setTags([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

  const handleSubmit = async (data: { title: string; content: string; imageUrl: string | null; tagIds: number[] }) => {
    if (!token || !communityId) return;

    const newPost = await postApi.createPost(
      token,
      data.title,
      data.content,
      data.imageUrl,
      parseInt(communityId, 10),
      data.tagIds
    );

    if (newPost) {
      navigate(`/posts/${newPost.id}`);
    } else {
      alert("Greška prilikom kreiranja objave.");
    }
  };

  if (loading) return <div className="text-center py-10">Učitavanje...</div>;

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
