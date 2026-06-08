import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { communityApi } from "../../api_services/communities/CommunityAPIService";
import { postApi } from "../../api_services/posts/PostAPIService";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { emptyCommunity, type Community, type CommunityMember, type CommunityMemberRole, type CommunityMemberStatus } from "../../types/communities/Community";
import type { Post } from "../../types/posts/Post";
import { Badge, Button, Card, Empty, ErrorBox, PageHeader, Select, SuccessBox } from "../../components/ui/UI";

type SortMode = "newest" | "popular" | "commented";

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
  const [sortMode, setSortMode] = useState<SortMode>("newest");

  const id = useMemo(() => {
    if (!params.id) return 0;
    const parsed = Number.parseInt(params.id, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [params.id]);

  const canModerate = user?.role === "admin" || community.memberRole === "moderator";
  const canCreatePost = !!token && (community.type === "public" || community.memberStatus === "active" || community.memberRole === "moderator" || user?.role === "admin");

  const sortedPosts = useMemo(() => {
    const next = [...posts];
    if (sortMode === "popular") return next.sort((a, b) => b.likesCount - a.likesCount);
    if (sortMode === "commented") return next.sort((a, b) => b.commentsCount - a.commentsCount);
    return next.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
  }, [posts, sortMode]);

  const loadMembers = useCallback(async () => {
    if (!token || id === 0) return;
    setMembers(await communityApi.getMembers(token, id));
  }, [id, token]);

  const loadCommunity = useCallback(async () => {
    if (id === 0) return;
    setLoading(true);
    try {
      const [item, communityPosts] = await Promise.all([
        communityApi.getCommunityById(id, token ?? undefined),
        postApi.getPostsByCommunity(id, token ?? undefined, sortMode),
      ]);

      if (item.id === 0) {
        setCommunity(emptyCommunity);
        setPosts([]);
        setError("Community not found");
        return;
      }

      const myCommunities = token ? await communityApi.getMyCommunities(token) : [];
      const membership = myCommunities.find((myCommunity) => myCommunity.id === item.id);
      setCommunity({ ...item, memberRole: membership?.memberRole ?? item.memberRole, memberStatus: membership?.memberStatus ?? item.memberStatus });
      setPosts(communityPosts);
      setError("");
    } catch {
      setError("Failed to load community");
    } finally {
      setLoading(false);
    }
  }, [id, token, sortMode]);

  useEffect(() => { void loadCommunity(); }, [loadCommunity]);
  useEffect(() => { if (canModerate) void loadMembers(); }, [canModerate, loadMembers]);

  const handleJoin = () => {
    if (!token || id === 0) return;
    communityApi.joinCommunity(token, id).then((result) => {
      if (!result.success) {
        setSuccess("");
        setError(result.message ?? "Join failed");
        return;
      }
      setError("");
      setSuccess(result.message ?? "Joined community successfully");
      return loadCommunity();
    }).catch(() => {
      setSuccess("");
      setError("Join failed");
    });
  };

  const handleLeave = () => {
    if (!token || id === 0) return;
    communityApi.leaveCommunity(token, id).then((ok) => {
      if (!ok) {
        setError("Leave failed");
        return;
      }
      setSuccess("Left community");
      return loadCommunity();
    }).catch(() => setError("Leave failed"));
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
    if (token) void runMemberAction(communityApi.updateMemberRole(token, id, memberId, role));
  };

  const changeStatus = (memberId: number, status: CommunityMemberStatus) => {
    if (token) void runMemberAction(communityApi.updateMemberStatus(token, id, memberId, status));
  };

  const removeMember = (memberId: number) => {
    if (token) void runMemberAction(communityApi.removeMember(token, id, memberId));
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Community" title={community.name || "Community Details"} action={canCreatePost ? <Button onClick={() => navigate(`/communities/${id}/posts/create`)}>Create post</Button> : undefined} />
      {id === 0 && <ErrorBox message="Invalid community id" />}
      {id !== 0 && error && <ErrorBox message={error} />}
      {id !== 0 && success && !error && <SuccessBox message={success} />}
      {id !== 0 && loading && <p className="text-sm text-gray-500">Loading...</p>}

      {community.id !== 0 && (
        <Card className="space-y-3 p-5">
          <p className="text-sm text-gray-700">{community.description ?? "No description"}</p>
          <p className="text-sm text-gray-600"><span className="font-medium text-gray-900">Rules:</span> {community.rules ?? "No rules"}</p>
          <div className="flex flex-wrap gap-2">
            <Badge tone="blue">{community.type}</Badge>
            {community.memberRole === "moderator" && <Badge tone="indigo">Moderator</Badge>}
            {community.memberStatus === "pending" && <Badge tone="yellow">Pending request</Badge>}
            {community.memberStatus === "active" && <Badge tone="green">Member</Badge>}
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {token && community.memberRole !== "moderator" && community.memberStatus !== "active" && community.memberStatus !== "pending" && <Button onClick={handleJoin}>Join</Button>}
            {token && community.memberRole !== "moderator" && community.memberStatus === "active" && <Button variant="secondary" onClick={handleLeave}>Leave</Button>}
            {!token && <p className="text-xs text-gray-500">Log in to join this community.</p>}
          </div>
        </Card>
      )}

      {canModerate && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Members</h2>
          {members.length === 0 ? <Empty message="No members found." /> : (
            <div className="grid gap-3">
              {members.map((member) => (
                <Card key={member.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">@{member.username}</p>
                    <p className="text-xs text-gray-500">{member.memberRole} / {member.memberStatus}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {member.memberStatus === "pending" && <Button onClick={() => changeStatus(member.id, "active")} className="px-3 py-1.5 text-xs">Accept</Button>}
                    {member.memberStatus !== "banned" && <Button variant="secondary" onClick={() => changeStatus(member.id, "banned")} className="px-3 py-1.5 text-xs">Ban</Button>}
                    {member.memberStatus === "banned" && <Button onClick={() => changeStatus(member.id, "active")} className="px-3 py-1.5 text-xs">Unban</Button>}
                    {member.memberStatus === "active" && member.memberRole === "member" && <Button variant="secondary" onClick={() => changeRole(member.id, "moderator")} className="px-3 py-1.5 text-xs">Make moderator</Button>}
                    {member.memberStatus === "active" && member.memberRole === "moderator" && member.id !== user?.id && <Button variant="secondary" onClick={() => changeRole(member.id, "member")} className="px-3 py-1.5 text-xs">Make member</Button>}
                    {member.id !== user?.id && <Button variant="danger" onClick={() => removeMember(member.id)} className="px-3 py-1.5 text-xs">Remove</Button>}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Posts</h2>
          <Select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)} className="sm:w-48">
            <option value="newest">Newest</option>
            <option value="popular">Popular</option>
            <option value="commented">Most commented</option>
          </Select>
        </div>
        {sortedPosts.length === 0 ? <Empty message="No posts in this community." /> : (
          <div className="grid gap-3">
            {sortedPosts.map((post) => (
              <Card key={post.id} className="p-4 transition-colors hover:border-blue-200 hover:bg-blue-50">
                <button onClick={() => navigate(`/posts/${post.id}`)} className="w-full text-left">
                  <p className="text-base font-semibold text-gray-900">{post.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">{post.content}</p>
                  <p className="mt-3 text-xs text-gray-500">@{post.authorUsername ?? "user"} - {post.likesCount} likes - {post.commentsCount} comments</p>
                </button>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
