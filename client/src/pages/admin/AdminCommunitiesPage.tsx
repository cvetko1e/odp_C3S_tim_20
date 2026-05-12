import { useEffect, useState } from "react";
import { communityApi } from "../../api_services/communities/CommunityAPIService";
import { CommunityCard } from "../../components/communities/CommunityCard";
import { Empty, ErrorBox, PageHeader } from "../../components/ui/UI";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { Community } from "../../types/communities/Community";

export default function AdminCommunitiesPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Community[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    let mounted = true;
    const fetchAllCommunities = async () => {
      try {
        const data = await communityApi.getAllCommunities(token);
        if (!mounted) return;
        setItems(data);
        setError("");
      } catch {
        if (!mounted) return;
        setError("Failed to load communities");
      }
    };

    void fetchAllCommunities();
    return () => {
      mounted = false;
    };
  }, [token]);

  const handleDelete = (id: number) => {
    if (!token) return;
    communityApi.deleteCommunity(token, id)
      .then((ok) => {
        if (!ok) {
          setError("Delete failed");
          return;
        }
        return communityApi.getAllCommunities(token).then((data) => {
          setItems(data);
          setError("");
        });
      })
      .catch(() => setError("Delete failed"));
  };

  return (
    <div>
      <PageHeader eyebrow="Admin" title="All Communities" />
      {!token && <ErrorBox message="Missing auth token" />}
      {token && error && <ErrorBox message={error} />}
      <div className="mt-4 grid gap-4">
        {items.map((community) => (
          <CommunityCard
            key={community.id}
            community={community}
            onDelete={handleDelete}
            showAdminActions
          />
        ))}
      </div>
      {token && items.length === 0 && !error && <Empty message="No communities found" />}
    </div>
  );
}
