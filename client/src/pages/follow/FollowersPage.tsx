import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { followApi } from "../../api_services/follow/FollowAPIService";
import { FollowButton } from "../../components/follow/FollowButton";
import { PageHeader, Spinner, Empty, ErrorBox, Card } from "../../components/ui/UI";
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
    followApi.getFollowers(userId).then((response) => {
      if (response.success && response.data) setFollowers(response.data);
      else setError(response.message);
      setLoading(false);
    });
  }, [userId]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <button onClick={() => navigate(-1)} className="text-xs font-medium text-gray-500 hover:text-gray-900">Back</button>
      <PageHeader eyebrow="Profile" title="Followers" />
      {error && <ErrorBox message={error} />}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : followers.length === 0 ? (
        <Empty message="No followers." />
      ) : (
        <div className="space-y-2">
          {followers.map((user) => (
            <Card key={user.id} className="flex items-center justify-between px-4 py-3">
              <button onClick={() => navigate(`/users/${user.id}`)} className="flex flex-col items-start hover:opacity-75">
                <span className="text-sm font-medium text-gray-900">@{user.username}</span>
                <span className="text-xs text-gray-500">{user.email}</span>
              </button>
              {currentUser && currentUser.id !== user.id && <FollowButton targetUserId={user.id} currentUserId={currentUser.id} initialIsFollowing={false} />}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
