import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { communityApi } from "../../api_services/communities/CommunityAPIService";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { Community } from "../../types/communities/Community";
import { ErrorBox, PageHeader } from "../../components/ui/UI";

export default function CommunityDetailsPage() {
  const params = useParams<{ id: string }>();
  const { token } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [error, setError] = useState("");

  const id = useMemo(() => {
    if (!params.id) return null;
    const parsed = Number.parseInt(params.id, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }, [params.id]);

  useEffect(() => {
    if (id === null) return;

    let mounted = true;
    const fetchCommunity = async () => {
      try {
        const item = await communityApi.getCommunityById(id, token ?? undefined);
        if (!mounted) return;
        if (!item) {
          setCommunity(null);
          setError("Community not found");
          return;
        }
        setCommunity(item);
        setError("");
      } catch {
        if (!mounted) return;
        setError("Failed to load community");
      }
    };

    void fetchCommunity();
    return () => {
      mounted = false;
    };
  }, [id, token]);

  const handleJoin = () => {
    if (!token || id === null) return;
    communityApi.joinCommunity(token, id)
      .then((ok) => {
        if (!ok) {
          setError("Join failed");
          return;
        }
        return communityApi.getCommunityById(id, token).then((item) => {
          if (!item) {
            setCommunity(null);
            setError("Community not found");
            return;
          }
          setCommunity(item);
          setError("");
        });
      })
      .catch(() => setError("Join failed"));
  };

  const handleLeave = () => {
    if (!token || id === null) return;
    communityApi.leaveCommunity(token, id)
      .then((ok) => {
        if (!ok) {
          setError("Leave failed");
          return;
        }
        return communityApi.getCommunityById(id, token).then((item) => {
          if (!item) {
            setCommunity(null);
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
    <div>
      <PageHeader eyebrow="Community" title={community?.name ?? "Community Details"} />
      {id === null && <ErrorBox message="Invalid community id" />}
      {id !== null && error && <ErrorBox message={error} />}

      {community && (
        <div className="bg-white/2 border border-white/8 rounded-2xl p-5 space-y-3">
          <p className="text-white/70 text-sm">{community.description ?? "No description"}</p>
          <p className="text-white/40 text-sm"><span className="text-white/60">Rules:</span> {community.rules ?? "No rules"}</p>
          <p className="text-white/40 text-sm"><span className="text-white/60">Type:</span> {community.type}</p>
          <p className="text-white/40 text-sm"><span className="text-white/60">Created:</span> {community.createdAt ?? "n/a"}</p>
          {community.memberStatus && <p className="text-white/40 text-sm"><span className="text-white/60">Member status:</span> {community.memberStatus}</p>}

          <div className="flex gap-2 pt-2">
            {token && (!community.memberStatus || community.memberStatus === "banned") && (
              <button onClick={handleJoin} className="px-3 py-2 text-xs rounded-lg border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 transition-colors">
                Join
              </button>
            )}
            {token && (community.memberStatus === "active" || community.memberStatus === "pending") && (
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
