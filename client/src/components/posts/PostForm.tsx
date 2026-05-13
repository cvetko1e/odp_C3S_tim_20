import React, { useState } from "react";
import type { Tag } from "../../types/tags/Tag";

interface PostFormProps {
  initialTitle?: string;
  initialContent?: string;
  initialImageUrl?: string;
  initialTagIds?: number[];
  availableTags: Tag[];
  onSubmit: (data: { title: string; content: string; imageUrl: string | null; tagIds: number[] }) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export const PostForm: React.FC<PostFormProps> = ({
  initialTitle = "",
  initialContent = "",
  initialImageUrl = "",
  initialTagIds = [],
  availableTags,
  onSubmit,
  onCancel,
  submitLabel = "Sačuvaj",
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(initialTagIds);
  const [error, setError] = useState<string | null>(null);

  const handleTagToggle = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Naslov i sadržaj su obavezni.");
      return;
    }
    setError(null);
    onSubmit({
      title: title.trim(),
      content: content.trim(),
      imageUrl: imageUrl.trim() || null,
      tagIds: selectedTagIds,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
      {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Naslov objave</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Unesite naslov..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Sadržaj (Markdown podržan)</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          placeholder="Napišite nešto... Možete koristiti Markdown."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">URL slike (Opciono)</label>
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="primer.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Izaberite tagove</label>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => {
            const isSelected = selectedTagIds.includes(tag.id);
            return (
              <button
                type="button"
                key={tag.id}
                onClick={() => handleTagToggle(tag.id)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                #{tag.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100"
        >
          Otkaži
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};
