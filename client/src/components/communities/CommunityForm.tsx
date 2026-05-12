import { useState, type FormEvent } from "react";
import type { CreateCommunityDto } from "../../types/communities/CreateCommunityDto";
import type { UpdateCommunityDto } from "../../types/communities/UpdateCommunityDto";

type CommunityFormProps = {
  initialValue?: CreateCommunityDto | UpdateCommunityDto;
  onSubmit: (dto: CreateCommunityDto) => void;
  submitLabel: string;
};

export function CommunityForm({ initialValue, onSubmit, submitLabel }: CommunityFormProps) {
  const [name, setName] = useState(initialValue?.name ?? "");
  const [description, setDescription] = useState(initialValue?.description ?? "");
  const [rules, setRules] = useState(initialValue?.rules ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initialValue?.avatarUrl ?? "");
  const [type, setType] = useState<"public" | "private">(initialValue?.type === "private" ? "private" : "public");
  const [error, setError] = useState("");

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (trimmedName.length < 2 || trimmedName.length > 80) {
      setError("Name must be between 2 and 80 characters.");
      return;
    }

    if (description.length > 500) {
      setError("Description must be at most 500 characters.");
      return;
    }

    if (type !== "public" && type !== "private") {
      setError("Type must be public or private.");
      return;
    }

    setError("");
    onSubmit({
      name: trimmedName,
      description: description.trim() ? description.trim() : null,
      rules: rules.trim() ? rules.trim() : null,
      avatarUrl: avatarUrl.trim() ? avatarUrl.trim() : null,
      type,
    });
  };

  return (
    <form onSubmit={submit} className="bg-white/2 border border-white/8 rounded-2xl p-5 space-y-4">
      {error && <p className="text-red-300 text-sm">{error}</p>}

      <div>
        <label className="text-xs text-white/50">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
      </div>

      <div>
        <label className="text-xs text-white/50">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full mt-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white min-h-20" />
      </div>

      <div>
        <label className="text-xs text-white/50">Rules</label>
        <textarea value={rules} onChange={(e) => setRules(e.target.value)} className="w-full mt-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white min-h-20" />
      </div>

      <div>
        <label className="text-xs text-white/50">Avatar URL</label>
        <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="w-full mt-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
      </div>

      <div>
        <label className="text-xs text-white/50">Type</label>
        <select value={type} onChange={(e) => setType(e.target.value === "private" ? "private" : "public")} className="w-full mt-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>

      <button type="submit" className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors">
        {submitLabel}
      </button>
    </form>
  );
}
