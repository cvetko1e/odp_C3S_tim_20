import React from "react";
import type { Tag } from "../../types/tags/Tag";

interface TagListProps {
  tags: Tag[];
  isAdmin?: boolean;
  onDeleteTag?: (id: number) => void;
}

export const TagList: React.FC<TagListProps> = ({ tags, isAdmin = false, onDeleteTag }) => {
  if (tags.length === 0) {
    return <p className="text-sm text-gray-500">Nema dostupnih tagova.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <div
          key={tag.id}
          className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full"
        >
          <span>#{tag.name}</span>
          {isAdmin && onDeleteTag && (
            <button
              onClick={() => onDeleteTag(tag.id)}
              className="text-gray-400 hover:text-red-600 font-bold text-xs transition-colors ml-1"
              title="Obriši tag"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
