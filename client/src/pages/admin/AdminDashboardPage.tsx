import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/ui/UI";

const tiles = [
  { label: "Users",       sub: "Manage roles & accounts", path: "/admin/users",       color: "text-sky-400" },
  { label: "Communities", sub: "View & delete communities", path: "/admin/communities", color: "text-emerald-400" },
  { label: "Tags",        sub: "Create & remove tags",    path: "/admin/tags",        color: "text-amber-400" },
  { label: "Audit Log",   sub: "View system activity",    path: "/admin/audit",       color: "text-violet-400" },
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
            className="bg-white/3 border border-white/6 rounded-2xl p-6 text-left hover:border-white/12 hover:bg-white/5 transition-all"
          >
            <p className={`text-lg font-semibold ${t.color}`}>{t.label}</p>
            <p className="text-xs text-white/30 mt-1">{t.sub}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
