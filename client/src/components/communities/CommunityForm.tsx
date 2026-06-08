import { useState, type FormEvent } from "react";
import type { CreateCommunityDto } from "../../types/communities/CreateCommunityDto";
import type { UpdateCommunityDto } from "../../types/communities/UpdateCommunityDto";
import { Button, Card, ErrorMessage, Input, Select, TextArea } from "../ui/UI";
import { validateCommunity } from "../../helpers/validators";

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

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateCommunity({ name, description, type });
    if (!validation.valid) {
      setError(validation.message ?? "Invalid community input.");
      return;
    }

    setError("");
    onSubmit({
      name: name.trim(),
      description: description.trim() ? description.trim() : null,
      rules: rules.trim() ? rules.trim() : null,
      avatarUrl: avatarUrl.trim() ? avatarUrl.trim() : null,
      type,
    });
  };

  return (
    <Card className="p-5">
      <form onSubmit={submit} className="space-y-4">
        {error && <ErrorMessage message={error} />}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Name</label>
          <Input value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
          <TextArea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Rules</label>
          <TextArea value={rules} onChange={(event) => setRules(event.target.value)} rows={3} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Avatar URL</label>
          <Input value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Type</label>
          <Select value={type} onChange={(event) => setType(event.target.value === "private" ? "private" : "public")}>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </Select>
        </div>
        <Button type="submit">{submitLabel}</Button>
      </form>
    </Card>
  );
}
