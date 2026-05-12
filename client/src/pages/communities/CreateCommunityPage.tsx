import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { communityApi } from "../../api_services/communities/CommunityAPIService";
import { CommunityForm } from "../../components/communities/CommunityForm";
import { ErrorBox, PageHeader } from "../../components/ui/UI";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { CreateCommunityDto } from "../../types/communities/CreateCommunityDto";

export default function CreateCommunityPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = (dto: CreateCommunityDto) => {
    if (!token) {
      setError("Missing auth token");
      return;
    }

    communityApi.createCommunity(token, dto)
      .then((created) => {
        if (!created) {
          setError("Failed to create community");
          return;
        }
        setError("");
        navigate(`/communities/${created.id}`);
      })
      .catch(() => setError("Failed to create community"));
  };

  return (
    <div>
      <PageHeader eyebrow="Community" title="Create Community" />
      {error && <ErrorBox message={error} />}
      <CommunityForm submitLabel="Create" onSubmit={handleSubmit} />
    </div>
  );
}
