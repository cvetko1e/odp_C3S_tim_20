import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { communityApi } from "../../api_services/communities/CommunityAPIService";
import { postApi } from "../../api_services/posts/PostAPIService";
import { CommunityCard } from "../../components/communities/CommunityCard";
import { PostCard } from "../../components/posts/PostCard";
import { Card, Empty, ErrorBox, PageHeader, Spinner } from "../../components/ui/UI";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { Community } from "../../types/communities/Community";
import type { Post } from "../../types/posts/Post";

export default function UserDashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [feed, setFeed] = useState<Post[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      setLoading(true);
      try {
        const [nextFeed, nextCommunities] = await Promise.all([
          postApi.getHomeFeed(token),
          communityApi.getMyCommunities(token),
        ]);
        setFeed(nextFeed);
        setCommunities(nextCommunities);
        setError("");
      } catch {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [token]);

  const tagStats = useMemo(() => {
    const counts = new Map<string, number>();
    feed.forEach((post) => {
      post.tags.forEach((tag) => counts.set(tag.name, (counts.get(tag.name) ?? 0) + 1));
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [feed]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Overview" title={`Welcome, ${user?.username}`} />
      {error && <ErrorBox message={error} />}
      {loading ? <div className="flex justify-center py-12"><Spinner size={28} /></div> : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Personalized Feed</h2>
            {feed.length === 0 ? <Empty message="No feed posts yet" /> : feed.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user?.id ?? null}
                isLikedInitially={false}
                onLikeToggle={() => undefined}
                onCardClick={(postId) => navigate(`/posts/${postId}`)}
              />
            ))}
          </section>

          <aside className="space-y-4">
            <Card className="p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Active Tags</h2>
              {tagStats.length === 0 ? <p className="mt-3 text-sm text-gray-500">No tag activity yet.</p> : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tagStats.map(([tag, count]) => (
                    <span key={tag} className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">#{tag} ({count})</span>
                  ))}
                </div>
              )}
            </Card>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">My Communities</h2>
              {communities.length === 0 ? <Empty message="You are not in any communities" /> : communities.slice(0, 4).map((community) => (
                <CommunityCard key={community.id} community={community} />
              ))}
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
