import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { postApi } from "../../api_services/posts/PostAPIService";
import { PostForm } from "../../components/posts/PostForm";
import AuthContext from "../../contexts/auth/AuthContext";
import type { Post } from "../../types/posts/Post";

export const EditPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const auth = useContext(AuthContext) as { token?: string; user?: { id: number; role: string } };
  const token = auth?.token;
  const user = auth?.user;
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const postId = parseInt(id || "0", 10);

  useEffect(() => {
    if (!postId || !token) return;

    postApi.getPostById(postId, token).then((data) => {
      if (data) {
        if (user && data.authorId !== user.id) {
          alert("Nemate ovlašćenje za izmenu ove objave.");
          navigate(-1);
          return;
        }
        setPost(data);
      }
      setLoading(false);
    });
  }, [postId, token, user, navigate]);

  const handleSubmit = async (data: { title: string; content: string; imageUrl: string | null }) => {
    if (!token || !post) return;

    const success = await postApi.updatePost(token, post.id, data.title, data.content, data.imageUrl);
    if (success) {
      navigate(`/posts/${post.id}`);
    } else {
      alert("Greška prilikom izmene objave.");
    }
  };

  if (loading) return <div className="text-center py-10">Učitavanje podataka...</div>;
  if (!post) return <div className="text-center py-10 text-red-500">Objava nije pronađena.</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Izmeni objavu</h1>
      <PostForm
        initialTitle={post.title}
        initialContent={post.content}
        initialImageUrl={post.imageUrl || ""}
        initialTagIds={post.tags?.map((t) => t.id) || []}
        availableTags={post.tags || []}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        submitLabel="Sačuvaj izmene"
      />
    </div>
  );
};
