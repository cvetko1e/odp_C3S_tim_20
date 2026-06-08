import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { communityApi } from "../../api_services/communities/CommunityAPIService";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { Community } from "../../types/communities/Community";
import { CommunityCard } from "../../components/communities/CommunityCard";
import { Empty, ErrorBox, PageHeader, SuccessBox } from "../../components/ui/UI";

export default function CommunitiesPage() {
  const { token, isAuthenticated } = useAuth();
  const [items, setItems] = useState<Community[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const canJoin = useMemo(() => isAuthenticated && !!token, [isAuthenticated, token]);

  const fetchCommunities = useCallback(async () => {
    setLoading(true);
    try {
      const publicCommunities = await communityApi.getPublicCommunities();
      const myCommunities = token ? await communityApi.getMyCommunities(token) : [];
      const myCommunitiesById = new Map(myCommunities.map((community) => [community.id, community]));

      setItems(publicCommunities.map((community) => ({
        ...community,
        memberRole: myCommunitiesById.get(community.id)?.memberRole ?? community.memberRole,
        memberStatus: myCommunitiesById.get(community.id)?.memberStatus ?? community.memberStatus,
      })));
      setError("");
    } catch (err) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        const message = err.response?.data?.message;
        setError(typeof message === "string" ? message : "Failed to load communities.");
        return;
      }
      setError("Failed to load communities.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchCommunities();
  }, [fetchCommunities]);

  const handleJoin = (id: number) => {
    if (!token) return;
    communityApi.joinCommunity(token, id)
      .then((result) => {
        if (!result.success) {
          setSuccess("");
          setError(result.message ?? "Join failed");
          return;
        }
        setError("");
        setSuccess(result.message ?? "Joined community successfully");
        void fetchCommunities();
      })
      .catch(() => {
        setSuccess("");
        setError("Join failed");
      });
  };

  return (
    <main>
      <div>
        <PageHeader eyebrow="Community" title="Communities" />
        {error && <ErrorBox message={error} />}
        {success && !error && <SuccessBox message={success} />}
        {loading && !error && <p className="mt-4 text-sm text-gray-500">Loading communities...</p>}
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
