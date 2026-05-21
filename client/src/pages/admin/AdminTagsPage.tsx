import { useEffect, useState } from "react";
import { PageHeader, Empty, ErrorBox, SuccessBox, Spinner } from "../../components/ui/UI";
import axios from "axios";
import { readItem } from "../../helpers/local_storage";

type Tag = { id: number; name: string };

const BASE = import.meta.env.VITE_API_URL + "tags";
const authHeader = () => {
  const token = readItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function AdminTagsPage() {
  const [tags, setTags]       = useState<Tag[]>([]);
  const [newTag, setNewTag]   = useState("");
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = () =>
    axios.get<{ success: boolean; data?: Tag[] }>(BASE, { headers: authHeader() })
      .then((r) => { if (r.data.success) setTags(r.data.data ?? []); })
      .catch(() => setError("Failed to load tags"));

  useEffect(() => { void load(); }, []);

  const handleCreate = async () => {
    if (!newTag.trim()) return;
    setCreating(true);
    setError("");
    setSuccess("");
    try {
      const res = await axios.post<{ success: boolean; message: string }>(
        BASE,
        { name: newTag.trim() },
        { headers: authHeader() }
      );
      if (res.data.success) {
        setNewTag("");
        setSuccess("Tag created");
        await load();
      } else {
        setError(res.data.message);
      }
    } catch {
      setError("Failed to create tag");
    }
    setCreating(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this tag?")) return;
    setDeleting(id);
    setError("");
    setSuccess("");
    try {
      const res = await axios.delete<{ success: boolean; message: string }>(
        `${BASE}/${id}`,
        { headers: authHeader() }
      );
      if (res.data.success) {
        setTags((prev) => prev.filter((t) => t.id !== id));
        setSuccess("Tag deleted");
      } else {
        setError(res.data.message);
      }
    } catch {
      setError("Failed to delete tag");
    }
    setDeleting(null);
  };

  return (
    <div>
      <PageHeader eyebrow="Admin" title="Tags" />
      {error   && <div className="mb-4"><ErrorBox message={error} /></div>}
      {success && <div className="mb-4"><SuccessBox message={success} /></div>}

      {/* Create */}
      <div className="flex gap-3 mb-6">
        <input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="New tag name..."
          maxLength={50}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20"
        />
        <button
          onClick={handleCreate}
          disabled={creating || !newTag.trim()}
          className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-sky-500/20 text-sky-400 border border-sky-500/20 rounded-lg hover:bg-sky-500/30 disabled:opacity-50 transition-colors"
        >
          {creating && <Spinner size={12} />}
          Create
        </button>
      </div>

      {/* List */}
      {tags.length === 0 ? (
        <Empty message="No tags yet" />
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/3 border border-white/6 rounded-xl"
            >
              <span className="text-sm text-white/60">#{t.name}</span>
              <button
                onClick={() => handleDelete(t.id)}
                disabled={deleting === t.id}
                className="text-white/20 hover:text-red-400 transition-colors text-xs disabled:opacity-30"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
