import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postApi } from "../../api_services/posts/PostAPIService";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { Post } from "../../types/posts/Post";
import { Button, Empty, ErrorBox, PageHeader, Table, TableHead } from "../../components/ui/UI";

export default function AdminPostsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState("");

  const load = async () => {
    if (!token) return;
    const data = await postApi.getAllPosts(token);
    setPosts(data);
    setError("");
  };

  useEffect(() => {
    void load();
  }, [token]);

  const deletePost = async (id: number) => {
    if (!token) return;
    const ok = await postApi.deletePost(token, id);
    if (!ok) {
      setError("Failed to delete post");
      return;
    }
    await load();
  };

  return (
    <div>
      <PageHeader eyebrow="Admin" title="All Posts" />
      {!token && <ErrorBox message="Missing auth token" />}
      {error && <ErrorBox message={error} />}
      {token && posts.length === 0 && !error ? <Empty message="No posts found" /> : (
        <Table>
          <TableHead columns={["Title", "Author", "Community", "Stats", "Actions"]} />
          <tbody className="divide-y divide-gray-200">
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="px-5 py-3">
                  <button onClick={() => navigate(`/posts/${post.id}`)} className="text-left font-medium text-gray-900 hover:text-blue-600">
                    {post.title}
                  </button>
                  <p className="mt-1 line-clamp-1 text-xs text-gray-500">{post.content}</p>
                </td>
                <td className="px-5 py-3 text-sm text-gray-600">@{post.authorUsername ?? post.authorId}</td>
                <td className="px-5 py-3 text-sm text-gray-600">#{post.communityId}</td>
                <td className="px-5 py-3 text-sm text-gray-600">{post.likesCount} likes / {post.commentsCount} comments</td>
                <td className="px-5 py-3">
                  <Button variant="danger" onClick={() => void deletePost(post.id)} className="px-3 py-1.5 text-xs">Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
