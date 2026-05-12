import { useEffect, useMemo, useState } from "react";
import { communityApi } from "../../api_services/communities/CommunityAPIService";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { Community } from "../../types/communities/Community";
import { CommunityCard } from "../../components/communities/CommunityCard";
import { Empty, ErrorBox, PageHeader } from "../../components/ui/UI";

export default function CommunitiesPage() {
  const { token, isAuthenticated } = useAuth();
  const [items, setItems] = useState<Community[]>([]);
  const [error, setError] = useState("");

  const canJoin = useMemo(() => isAuthenticated && !!token, [isAuthenticated, token]);

  const load = () => {
    communityApi.getPublicCommunities()
      .then((data) => {
        setItems(data);
        setError("");
      })
      .catch(() => setError("Failed to load communities"));
  };

  useEffect(() => {
    load();
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
        load();
      })
      .catch(() => setError("Join failed"));
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <PageHeader eyebrow="Community" title="Public Communities" />
      {error && <ErrorBox message={error} />}
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
      {items.length === 0 && !error && <Empty message="No public communities yet" />}
    </div>
  );
}
