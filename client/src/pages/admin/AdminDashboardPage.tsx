import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/ui/UI";

const tiles = [
  { label: "Users",       sub: "Manage roles & accounts", path: "/admin/users",       color: "text-sky-400" },
  { label: "Communities", sub: "View & delete communities", path: "/admin/communities", color: "text-emerald-400" },
  { label: "Tags",        sub: "Create & remove tags",    path: "/admin/tags",        color: "text-amber-400" },
  { label: "Audit Log",   sub: "View system activity",    path: "/admin/audit",       color: "text-violet-400" },
  { label: "Health", sub: "DB nodes & failover", path: "/admin/health", color: "text-rose-400" },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader eyebrow="Admin" title="Dashboard" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        {tiles.map((t) => (
          <button
            key={t.path}
            onClick={() => navigate(t.path)}
            className="rounded-lg border border-gray-200 bg-white p-6 text-left shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50"
          >
            <p className={`text-lg font-semibold ${t.color}`}>{t.label}</p>
            <p className="mt-1 text-sm text-gray-500">{t.sub}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
