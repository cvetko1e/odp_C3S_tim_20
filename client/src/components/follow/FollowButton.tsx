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

  if (targetUserId === currentUserId) return <></>;

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
          ? "border-gray-300 bg-white text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
      }`}
    >
      {loading && <Spinner size={12} />}
      {isFollowing ? "Otprati" : "Prati"}
    </button>
  );
};
