import { useEffect, useState } from "react";
import { communityApi } from "../../api_services/communities/CommunityAPIService";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { Community } from "../../types/communities/Community";
import { CommunityCard } from "../../components/communities/CommunityCard";
import { Empty, ErrorBox, PageHeader } from "../../components/ui/UI";

export default function MyCommunitiesPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Community[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    let mounted = true;
    const fetchMyCommunities = async () => {
      try {
        const data = await communityApi.getMyCommunities(token);
        if (!mounted) return;
        setItems(data);
        setError("");
      } catch {
        if (!mounted) return;
        setError("Failed to load your communities");
      }
    };

    void fetchMyCommunities();
    return () => {
      mounted = false;
    };
  }, [token]);

  const handleLeave = (id: number) => {
    if (!token) return;
    communityApi.leaveCommunity(token, id)
      .then((ok) => {
        if (!ok) {
          setError("Leave failed");
          return;
        }
        return communityApi.getMyCommunities(token).then((data) => {
          setItems(data);
          setError("");
        });
      })
      .catch(() => setError("Leave failed"));
  };

  return (
    <div>
      <PageHeader eyebrow="Community" title="My Communities" />
      {!token && <ErrorBox message="Missing auth token" />}
      {token && error && <ErrorBox message={error} />}
      <div className="mt-4 grid gap-4">
        {items.map((community) => (
          <CommunityCard
            key={community.id}
            community={community}
            onLeave={handleLeave}
            showMembershipActions
          />
        ))}
      </div>
      {token && items.length === 0 && !error && <Empty message="You are not a member of a community yet" />}
    </div>
  );
}
