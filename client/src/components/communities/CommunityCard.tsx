import { Link } from "react-router-dom";
import type { Community } from "../../types/communities/Community";
import { Badge, Button, Card } from "../ui/UI";

type CommunityCardProps = {
  community: Community;
  onJoin?: (id: number) => void;
  onLeave?: (id: number) => void;
  onDelete?: (id: number) => void;
  showAdminActions?: boolean;
  showMembershipActions?: boolean;
};

export function CommunityCard({
  community,
  onJoin,
  onLeave,
  onDelete,
  showAdminActions = false,
  showMembershipActions = false,
}: CommunityCardProps) {
  const membershipLabel = (() => {
    if (community.memberRole === "moderator") return "Moderator";
    if (community.memberStatus === "pending") return "Pending request";
    if (community.memberStatus === "active") return "Member";
    if (community.memberStatus === "banned") return "Banned";
    return "";
  })();

  const canJoin = showMembershipActions && !!onJoin && community.memberRole !== "moderator" && community.memberStatus !== "active" && community.memberStatus !== "pending";
  const canLeave = showMembershipActions && !!onLeave && community.memberRole !== "moderator" && community.memberStatus === "active";

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{community.name}</h3>
          <p className="mt-1 text-sm text-gray-500">Type: {community.type}</p>
        </div>
        {membershipLabel && <Badge tone={community.memberStatus === "pending" ? "yellow" : "green"}>{membershipLabel}</Badge>}
      </div>

      <p className="mt-3 text-sm text-gray-600">{community.description ?? "No description"}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link to={`/communities/${community.id}`} className="inline-flex rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">
          Details
        </Link>
        {canJoin && <Button type="button" onClick={() => onJoin(community.id)} className="px-3 py-2 text-xs">Join</Button>}
        {canLeave && <Button type="button" variant="secondary" onClick={() => onLeave(community.id)} className="px-3 py-2 text-xs">Leave</Button>}
        {showAdminActions && onDelete && <Button type="button" variant="danger" onClick={() => onDelete(community.id)} className="px-3 py-2 text-xs">Delete</Button>}
      </div>
    </Card>
  );
}
