import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usersApi } from "../../api_services/users/UsersAPIService";
import { followApi } from "../../api_services/follow/FollowAPIService";
import { FollowButton } from "../../components/follow/FollowButton";
import { PageHeader, Spinner, ErrorBox } from "../../components/ui/UI";
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
      const res = await usersApi.getById(userId);
      if (res.success && res.data) {
        setProfile(res.data);
        setFollowersCount(res.data.followersCount ?? 0);
        setFollowingCount(res.data.followingCount ?? 0);

        // Check if current user follows this profile
        if (currentUser && currentUser.id !== userId) {
          const followers = await followApi.getFollowers(userId);
          if (followers.success && followers.data) {
            setIsFollowing(followers.data.some((u) => u.id === currentUser.id));
          }
        }
      } else {
        setError("Korisnik nije pronađen.");
      }
      setLoading(false);
    };
    load();
  }, [userId, currentUser]);

  const handleFollowToggle = (nowFollowing: boolean) => {
    setIsFollowing(nowFollowing);
    setFollowersCount((c) => (nowFollowing ? c + 1 : c - 1));
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>;
  if (error || !profile) return <div className="max-w-2xl mx-auto py-8 px-4"><ErrorBox message={error || "Greška"} /></div>;

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="text-xs text-white/30 hover:text-white/50 transition-colors"
      >
        ← Nazad
      </button>

      <PageHeader eyebrow="Profil" title={`@${profile.username}`} />

      {/* Profile card */}
      <div className="bg-white/3 border border-white/6 rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-white">{profile.username}</p>
            <p className="text-sm text-white/30">{profile.email}</p>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${
              profile.role === "admin"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : "bg-white/5 text-white/40 border-white/10"
            }`}>
              {profile.role}
            </span>
          </div>

          {!isOwnProfile && currentUser && (
            <FollowButton
              targetUserId={userId}
              currentUserId={currentUser.id}
              initialIsFollowing={isFollowing}
              onToggle={handleFollowToggle}
            />
          )}
        </div>

        {/* Follower stats */}
        <div className="flex items-center gap-6 pt-4 border-t border-white/6">
          <button
            onClick={() => navigate(`/users/${userId}/followers`)}
            className="text-center hover:opacity-70 transition-opacity"
          >
            <p className="text-lg font-semibold text-white">{followersCount}</p>
            <p className="text-xs text-white/30">Pratioci</p>
          </button>
          <button
            onClick={() => navigate(`/users/${userId}/following`)}
            className="text-center hover:opacity-70 transition-opacity"
          >
            <p className="text-lg font-semibold text-white">{followingCount}</p>
            <p className="text-xs text-white/30">Praćeni</p>
          </button>
        </div>
      </div>
    </div>
  );
};
