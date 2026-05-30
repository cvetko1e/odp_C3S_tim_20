import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { communityApi } from "../../api_services/communities/CommunityAPIService";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { Community } from "../../types/communities/Community";
import { CommunityCard } from "../../components/communities/CommunityCard";
import { Empty, ErrorBox, PageHeader } from "../../components/ui/UI";

export default function CommunitiesPage() {
  const { token, isAuthenticated } = useAuth();
  const [items, setItems] = useState<Community[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const canJoin = useMemo(() => isAuthenticated && !!token, [isAuthenticated, token]);

  const fetchCommunities = async () => {
    communityApi.getPublicCommunities()
      .then((data) => {
        setItems(data);
        setError("");
      })
      .catch((err) => {
        if (axios.isAxiosError<{ message?: string }>(err)) {
          const message = err.response?.data?.message;
          setError(typeof message === "string" ? message : "Failed to load communities.");
          return;
        }
        setError("Failed to load communities.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleJoin = (id: number) => {
    if (!token) return;
    communityApi.joinCommunity(token, id)
      .then((ok) => {
        if (!ok) {
          setError("Join failed");
          return;
        }
        setError("");
        setLoading(true);
        fetchCommunities();
      })
      .catch(() => setError("Join failed"));
  };

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <PageHeader eyebrow="Community" title="Communities" />
      {error && <ErrorBox message={error} />}
        {loading && !error && <p className="mt-4 text-sm text-white/70">Loading communities...</p>}
        {!loading && !error && items.length === 0 && <Empty message="No communities found." />}
        {!loading && items.length > 0 && (
          <div className="mt-4 grid gap-4">
            {items.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                onJoin={canJoin ? handleJoin : undefined}
                showMembershipActions={canJoin}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
