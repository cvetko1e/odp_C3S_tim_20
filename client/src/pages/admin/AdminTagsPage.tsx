import { useCallback, useEffect, useState } from "react";
import { PageHeader, Empty, ErrorBox, SuccessBox, Spinner, Button, Card, Input, Badge } from "../../components/ui/UI";
import { tagApi } from "../../api_services/tags/TagAPIService";
import type { Tag } from "../../types/tags/Tag";
import { validateTag } from "../../helpers/validators";
import { useAuth } from "../../hooks/auth/useAuthHook";

export default function AdminTagsPage() {
  const { token } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(async () => {
    const data = await tagApi.getAllTags();
    setTags(data);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const handleCreate = async () => {
    const validation = validateTag(newTag);
    if (!validation.valid) {
      setError(validation.message ?? "Invalid tag name.");
      return;
    }

    setCreating(true);
    setError("");
    setSuccess("");
    const created = token ? await tagApi.createTag(token, newTag.trim()) : { id: 0, name: "" };
    if (created.id !== 0) {
      setNewTag("");
      setSuccess("Tag created");
      await load();
    } else {
      setError("Failed to create tag");
    }
    setCreating(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this tag?")) return;
    setDeleting(id);
    setError("");
    setSuccess("");
    const deleted = token ? await tagApi.deleteTag(token, id) : false;
    if (deleted) {
      setTags((current) => current.filter((tag) => tag.id !== id));
      setSuccess("Tag deleted");
    } else {
      setError("Failed to delete tag");
    }
    setDeleting(null);
  };

  return (
    <div>
      <PageHeader eyebrow="Admin" title="Tags" />
      {error && <div className="mb-4"><ErrorBox message={error} /></div>}
      {success && <div className="mb-4"><SuccessBox message={success} /></div>}

      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input value={newTag} onChange={(event) => setNewTag(event.target.value)} onKeyDown={(event) => event.key === "Enter" && handleCreate()} placeholder="New tag name..." maxLength={50} />
          <Button onClick={handleCreate} disabled={creating || !newTag.trim()} className="gap-2">
            {creating && <Spinner size={12} />}
            Create
          </Button>
        </div>
      </Card>

      {tags.length === 0 ? (
        <Empty message="No tags yet" />
      ) : (
        <Card className="p-4">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center gap-2">
                <Badge tone="blue">#{tag.name}</Badge>
                <button onClick={() => handleDelete(tag.id)} disabled={deleting === tag.id} className="text-xs font-semibold text-gray-400 transition-colors hover:text-red-600 disabled:opacity-30">
                  x
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
