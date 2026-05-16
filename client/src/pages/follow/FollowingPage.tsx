import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { followApi } from "../../api_services/follow/FollowAPIService";
import { FollowButton } from "../../components/follow/FollowButton";
import { PageHeader, Spinner, Empty, ErrorBox } from "../../components/ui/UI";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { UserDto } from "../../models/user/UserTypes";

export const FollowingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [following, setFollowing] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = Number.parseInt(id ?? "0", 10);

  useEffect(() => {
    if (!userId) return;
    followApi.getFollowing(userId).then((res) => {
      if (res.success && res.data) setFollowing(res.data);
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

      <PageHeader eyebrow="Profil" title="Praćeni" />

      {error && <ErrorBox message={error} />}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : following.length === 0 ? (
        <Empty message="Ne prati nijednog korisnika." />
      ) : (
        <div className="space-y-2">
          {following.map((u) => (
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
                  initialIsFollowing={true}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
