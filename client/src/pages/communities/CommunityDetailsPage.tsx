import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { communityApi } from "../../api_services/communities/CommunityAPIService";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { emptyCommunity, type Community } from "../../types/communities/Community";
import { ErrorBox, PageHeader, SuccessBox } from "../../components/ui/UI";

export default function CommunityDetailsPage() {
  const params = useParams<{ id: string }>();
  const { token } = useAuth();
  const [community, setCommunity] = useState<Community>(emptyCommunity);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const id = useMemo(() => {
    if (!params.id) return 0;
    const parsed = Number.parseInt(params.id, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [params.id]);

  const loadCommunity = useCallback(async () => {
    if (id === 0) return;

    setLoading(true);
    try {
      const item = await communityApi.getCommunityById(id, token ?? undefined);
      if (item.id === 0) {
        setCommunity(emptyCommunity);
        setError("Community not found");
        setLoading(false);
        return;
      }

      const myCommunities = token ? await communityApi.getMyCommunities(token) : [];
      const membership = myCommunities.find((myCommunity) => myCommunity.id === item.id);
      setCommunity({
        ...item,
        memberRole: membership?.memberRole ?? item.memberRole,
        memberStatus: membership?.memberStatus ?? item.memberStatus,
      });
      setError("");
    } catch {
      setError("Failed to load community");
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    void loadCommunity();
  }, [loadCommunity]);

  const handleJoin = () => {
    if (!token || id === 0) return;
    communityApi.joinCommunity(token, id)
      .then((result) => {
        if (!result.success) {
          setSuccess("");
          setError(result.message ?? "Join failed");
          return;
        }
        setError("");
        setSuccess(result.message ?? "Joined community successfully");
        return loadCommunity();
      })
      .catch(() => {
        setSuccess("");
        setError("Join failed");
      });
  };

  const handleLeave = () => {
    if (!token || id === 0) return;
    communityApi.leaveCommunity(token, id)
      .then((ok) => {
        if (!ok) {
          setError("Leave failed");
          return;
        }
        return communityApi.getCommunityById(id, token).then((item) => {
          if (item.id === 0) {
            setCommunity(emptyCommunity);
            setError("Community not found");
            return;
          }
          setCommunity(item);
          setError("");
        });
      })
      .catch(() => setError("Leave failed"));
  };

  return (
    <div className="min-h-screen bg-[#502e2e]">
      <PageHeader eyebrow="Community" title={community.name || "Community Details"} />
      {id === 0 && <ErrorBox message="Invalid community id" />}
      {id !== 0 && error && <ErrorBox message={error} />}
      {id !== 0 && success && !error && <SuccessBox message={success} />}
      {id !== 0 && loading && <p className="mt-4 text-sm text-white/70">Loading...</p>}
      {id !== 0 && !loading && !error && community.id === 0 && <p className="mt-4 text-sm text-white/70">Community not found.</p>}

      {community.id !== 0 && (
        <div className="bg-white/2 border border-white/8 rounded-2xl p-5 space-y-3">
          <p className="text-white/70 text-sm">{community.description ?? "No description"}</p>
          <p className="text-white/40 text-sm"><span className="text-white/60">Rules:</span> {community.rules ?? "No rules"}</p>
          <p className="text-white/40 text-sm"><span className="text-white/60">Type:</span> {community.type}</p>
          <p className="text-white/40 text-sm"><span className="text-white/60">Created:</span> {community.createdAt ?? "n/a"}</p>
          {community.memberRole === "moderator" && <p className="text-white/40 text-sm"><span className="text-white/60">Membership:</span> Moderator</p>}
          {community.memberRole !== "moderator" && community.memberStatus === "pending" && <p className="text-white/40 text-sm"><span className="text-white/60">Membership:</span> Pending request</p>}
          {community.memberRole !== "moderator" && community.memberStatus === "active" && <p className="text-white/40 text-sm"><span className="text-white/60">Membership:</span> Member</p>}

          <div className="flex gap-2 pt-2">
            {token && community.memberRole !== "moderator" && community.memberStatus !== "active" && community.memberStatus !== "pending" && (
              <button onClick={handleJoin} className="px-3 py-2 text-xs rounded-lg border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 transition-colors">
                Join
              </button>
            )}
            {token && community.memberRole !== "moderator" && community.memberStatus === "active" && (
              <button onClick={handleLeave} className="px-3 py-2 text-xs rounded-lg border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 transition-colors">
                Leave
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
