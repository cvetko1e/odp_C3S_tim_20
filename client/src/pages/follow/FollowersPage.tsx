import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { followApi } from "../../api_services/follow/FollowAPIService";
import { FollowButton } from "../../components/follow/FollowButton";
import { PageHeader, Spinner, Empty, ErrorBox } from "../../components/ui/UI";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { UserDto } from "../../models/user/UserTypes";

export const FollowersPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [followers, setFollowers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = Number.parseInt(id ?? "0", 10);

  useEffect(() => {
    if (!userId) return;
    followApi.getFollowers(userId).then((res) => {
      if (res.success && res.data) setFollowers(res.data);
      else setError(res.message);
      setLoading(false);
    });
  }, [userId]);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="text-xs text-white/30 hover:text-white/50 transition-colors"
      >
        ← Nazad
      </button>

      <PageHeader eyebrow="Profil" title="Pratioci" />

      {error && <ErrorBox message={error} />}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : followers.length === 0 ? (
        <Empty message="Nema pratilaca." />
      ) : (
        <div className="space-y-2">
          {followers.map((u) => (
            <div
              key={u.id}
              className="bg-white/3 border border-white/6 rounded-xl px-4 py-3 flex items-center justify-between"
            >
              <button
                onClick={() => navigate(`/users/${u.id}`)}
                className="flex flex-col items-start hover:opacity-70 transition-opacity"
              >
                <span className="text-sm font-medium text-white">@{u.username}</span>
                <span className="text-xs text-white/30">{u.email}</span>
              </button>

              {currentUser && currentUser.id !== u.id && (
                <FollowButton
                  targetUserId={u.id}
                  currentUserId={currentUser.id}
                  initialIsFollowing={false}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
