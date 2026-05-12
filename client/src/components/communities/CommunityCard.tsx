import { Link } from "react-router-dom";
import type { Community } from "../../types/communities/Community";

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
  return (
    <div className="bg-white/2 border border-white/8 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-white text-lg font-semibold">{community.name}</h3>
          <p className="text-xs text-white/35 mt-1">Type: {community.type}</p>
        </div>
        {community.memberStatus && (
          <span className="text-xs px-2 py-1 rounded-lg border border-white/10 text-white/60">{community.memberStatus}</span>
        )}
      </div>

      <p className="text-sm text-white/70 mt-3">{community.description ?? "No description"}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to={`/communities/${community.id}`}
          className="px-3 py-2 text-xs rounded-lg border border-white/15 text-white/80 hover:bg-white/5 transition-colors"
        >
          Details
        </Link>

        {showMembershipActions && onJoin && (
          <button
            onClick={() => onJoin(community.id)}
            className="px-3 py-2 text-xs rounded-lg border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 transition-colors"
          >
            Join
          </button>
        )}

        {showMembershipActions && onLeave && (
          <button
            onClick={() => onLeave(community.id)}
            className="px-3 py-2 text-xs rounded-lg border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 transition-colors"
          >
            Leave
          </button>
        )}

        {showAdminActions && onDelete && (
          <button
            onClick={() => onDelete(community.id)}
            className="px-3 py-2 text-xs rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/10 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
