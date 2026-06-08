import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usersApi } from "../../api_services/users/UsersAPIService";
import { followApi } from "../../api_services/follow/FollowAPIService";
import { FollowButton } from "../../components/follow/FollowButton";
import { PageHeader, Spinner, ErrorBox, Card, RoleBadge } from "../../components/ui/UI";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { UserDto } from "../../models/user/UserTypes";

export const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserDto | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = Number.parseInt(id ?? "0", 10);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setLoading(true);
      const response = await usersApi.getById(userId);
      if (response.success && response.data) {
        setProfile(response.data);
        setFollowersCount(response.data.followersCount ?? 0);
        setFollowingCount(response.data.followingCount ?? 0);
        if (currentUser && currentUser.id !== userId) {
          const followers = await followApi.getFollowers(userId);
          if (followers.success && followers.data) setIsFollowing(followers.data.some((user) => user.id === currentUser.id));
        }
      } else {
        setError("User not found.");
      }
      setLoading(false);
    };
    void load();
  }, [userId, currentUser]);

  const handleFollowToggle = (nowFollowing: boolean) => {
    setIsFollowing(nowFollowing);
    setFollowersCount((count) => (nowFollowing ? count + 1 : count - 1));
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>;
  if (error || !profile) return <div className="mx-auto max-w-2xl"><ErrorBox message={error || "Failed to load user."} /></div>;

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <button onClick={() => navigate(-1)} className="text-xs font-medium text-gray-500 hover:text-gray-900">Back</button>
      <PageHeader eyebrow="Profile" title={`@${profile.username}`} />
      <Card className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-900">{profile.username}</p>
            <p className="text-sm text-gray-500">{profile.email}</p>
            <RoleBadge role={profile.role} />
          </div>
          {!isOwnProfile && currentUser && (
            <FollowButton targetUserId={userId} currentUserId={currentUser.id} initialIsFollowing={isFollowing} onToggle={handleFollowToggle} />
          )}
        </div>
        <div className="flex items-center gap-8 border-t border-gray-200 pt-4">
          <button onClick={() => navigate(`/users/${userId}/followers`)} className="text-center hover:opacity-75">
            <p className="text-lg font-semibold text-gray-900">{followersCount}</p>
            <p className="text-xs text-gray-500">Followers</p>
          </button>
          <button onClick={() => navigate(`/users/${userId}/following`)} className="text-center hover:opacity-75">
            <p className="text-lg font-semibold text-gray-900">{followingCount}</p>
            <p className="text-xs text-gray-500">Following</p>
          </button>
        </div>
      </Card>
    </div>
  );
};
