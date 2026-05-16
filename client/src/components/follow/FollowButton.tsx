import React, { useState } from "react";
import { followApi } from "../../api_services/follow/FollowAPIService";
import { Spinner } from "../ui/UI";

interface FollowButtonProps {
  targetUserId: number;
  currentUserId: number;
  initialIsFollowing: boolean;
  onToggle?: (isFollowing: boolean) => void;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  targetUserId,
  currentUserId,
  initialIsFollowing,
  onToggle,
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  if (targetUserId === currentUserId) return null;

  const handleClick = async () => {
    setLoading(true);
    if (isFollowing) {
      const res = await followApi.unfollow(targetUserId);
      if (res.success) {
        setIsFollowing(false);
        onToggle?.(false);
      }
    } else {
      const res = await followApi.follow(targetUserId);
      if (res.success) {
        setIsFollowing(true);
        onToggle?.(true);
      }
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 ${
        isFollowing
          ? "bg-white/5 text-white/40 border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
          : "bg-sky-500/20 text-sky-400 border-sky-500/20 hover:bg-sky-500/30"
      }`}
    >
      {loading && <Spinner size={12} />}
      {isFollowing ? "Otprati" : "Prati"}
    </button>
  );
};
