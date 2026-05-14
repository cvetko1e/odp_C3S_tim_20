import React from "react";

interface LikeButtonProps {
  likesCount: number;
  isLiked: boolean;
  onLikeToggle: () => void;
  disabled?: boolean;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  likesCount,
  isLiked,
  onLikeToggle,
  disabled = false,
}) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Sprečava otvaranje cele objave na klik dugmeta
        if (!disabled) onLikeToggle();
      }}
      disabled={disabled}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        isLiked
          ? "bg-red-100 text-red-600 hover:bg-red-200"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill={isLiked ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-4 h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>
      <span>{likesCount}</span>
    </button>
  );
};
