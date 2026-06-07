import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { communityApi } from "../../api_services/communities/CommunityAPIService";
import { postApi } from "../../api_services/posts/PostAPIService";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { emptyCommunity, type Community, type CommunityMember, type CommunityMemberRole, type CommunityMemberStatus } from "../../types/communities/Community";
import type { Post } from "../../types/posts/Post";
import { Empty, ErrorBox, PageHeader, SuccessBox } from "../../components/ui/UI";

export default function CommunityDetailsPage() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [community, setCommunity] = useState<Community>(emptyCommunity);
  const [posts, setPosts] = useState<Post[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const id = useMemo(() => {
    if (!params.id) return 0;
    const parsed = Number.parseInt(params.id, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [params.id]);

  const canModerate = user?.role === "admin" || community.memberRole === "moderator";

  const loadMembers = useCallback(async () => {
    if (!token || id === 0) return;
    const data = await communityApi.getMembers(token, id);
    setMembers(data);
  }, [id, token]);

  const loadCommunity = useCallback(async () => {
    if (id === 0) return;

    setLoading(true);
    try {
      const [item, communityPosts] = await Promise.all([
        communityApi.getCommunityById(id, token ?? undefined),
        postApi.getPostsByCommunity(id, token ?? undefined),
      ]);

      if (item.id === 0) {
        setCommunity(emptyCommunity);
        setPosts([]);
        setError("Community not found");
        setLoading(false);
        return;
      }

      const myCommunities = token ? await communityApi.getMyCommunities(token) : [];
      const membership = myCommunities.find((myCommunity) => myCommunity.id === item.id);
      const nextCommunity = {
        ...item,
        memberRole: membership?.memberRole ?? item.memberRole,
        memberStatus: membership?.memberStatus ?? item.memberStatus,
      };

      setCommunity(nextCommunity);
      setPosts(communityPosts);
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

  useEffect(() => {
    if (canModerate) void loadMembers();
  }, [canModerate, loadMembers]);

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
        setSuccess("Left community");
        return loadCommunity();
      })
      .catch(() => setError("Leave failed"));
  };

  const runMemberAction = async (action: Promise<{ success: boolean; message?: string }>) => {
    const result = await action;
    if (!result.success) {
      setSuccess("");
      setError(result.message ?? "Member action failed");
      return;
    }
    setError("");
    setSuccess(result.message ?? "Member updated");
    await loadMembers();
    await loadCommunity();
  };

  const changeRole = (memberId: number, role: CommunityMemberRole) => {
    if (!token) return;
    void runMemberAction(communityApi.updateMemberRole(token, id, memberId, role));
  };

  const changeStatus = (memberId: number, status: CommunityMemberStatus) => {
    if (!token) return;
    void runMemberAction(communityApi.updateMemberStatus(token, id, memberId, status));
  };

  const removeMember = (memberId: number) => {
    if (!token) return;
    void runMemberAction(communityApi.removeMember(token, id, memberId));
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
          <section className="bg-white/2 border border-white/8 rounded-2xl p-5 space-y-3">
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
              {!token && <p className="text-xs text-white/35">Prijavite se da biste se pridruzili zajednici.</p>}
            </div>
          </section>
        )}

        {canModerate && (
          <section className="space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-widest text-white/25">Members</h2>
            {members.length === 0 ? (
              <Empty message="No members found." />
            ) : (
              <div className="grid gap-3">
                {members.map((member) => (
                  <div key={member.id} className="bg-white/3 border border-white/6 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">@{member.username}</p>
                      <p className="text-xs text-white/35">{member.memberRole} / {member.memberStatus}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {member.memberStatus === "pending" && (
                        <button onClick={() => changeStatus(member.id, "active")} className="px-3 py-1.5 text-xs rounded-lg border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10">Accept</button>
                      )}
                      {member.memberStatus !== "banned" && (
                        <button onClick={() => changeStatus(member.id, "banned")} className="px-3 py-1.5 text-xs rounded-lg border border-amber-500/30 text-amber-300 hover:bg-amber-500/10">Ban</button>
                      )}
                      {member.memberStatus === "banned" && (
                        <button onClick={() => changeStatus(member.id, "active")} className="px-3 py-1.5 text-xs rounded-lg border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10">Unban</button>
                      )}
                      {member.memberStatus === "active" && member.memberRole === "member" && (
                        <button onClick={() => changeRole(member.id, "moderator")} className="px-3 py-1.5 text-xs rounded-lg border border-sky-500/30 text-sky-300 hover:bg-sky-500/10">Make moderator</button>
                      )}
                      {member.memberStatus === "active" && member.memberRole === "moderator" && member.id !== user?.id && (
                        <button onClick={() => changeRole(member.id, "member")} className="px-3 py-1.5 text-xs rounded-lg border border-violet-500/30 text-violet-300 hover:bg-violet-500/10">Make member</button>
                      )}
                      {member.id !== user?.id && (
                        <button onClick={() => removeMember(member.id)} className="px-3 py-1.5 text-xs rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/10">Remove</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-sm font-mono uppercase tracking-widest text-white/25">Posts</h2>
          {posts.length === 0 ? (
            <Empty message="No posts in this community." />
          ) : (
            <div className="grid gap-3">
              {posts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => navigate(`/posts/${post.id}`)}
                  className="text-left bg-white/3 border border-white/6 rounded-xl p-4 hover:border-white/12 hover:bg-white/5 transition-colors"
                >
                  <p className="text-base font-semibold text-white">{post.title}</p>
                  <p className="text-sm text-white/45 mt-1 line-clamp-2">{post.content}</p>
                  <p className="text-xs text-white/30 mt-3">@{post.authorUsername ?? "korisnik"} · {post.likesCount} lajkova · {post.commentsCount} komentara</p>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
  );
}
