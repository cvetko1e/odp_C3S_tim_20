import { useState, type ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { Badge, Button, RoleBadge } from "../ui/UI";

const publicNav = [
  { to: "/communities", label: "Communities" },
];

const userNav = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/my-communities", label: "My Communities" },
  { to: "/communities/create", label: "Create Community" },
];

const adminNav = [
  { to: "/admin", label: "Admin Dashboard" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/communities", label: "Communities" },
  { to: "/admin/tags", label: "Tags" },
  { to: "/admin/audit", label: "Audit Log" },
  { to: "/admin/health", label: "Health" },
];

function NavSection({ title, items, close }: { title: string; items: { to: string; label: string }[]; close: () => void }) {
  if (items.length === 0) return <></>;
  return (
    <div className="space-y-1">
      <p className="px-3 pb-2 pt-4 text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</p>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end
          onClick={close}
          className={({ isActive }) =>
            `flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const sidebar = (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-5">
        <Link to="/communities" onClick={close} className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">PN</div>
          <div>
            <p className="text-sm font-semibold text-gray-900">PulseNet</p>
            <p className="text-xs text-gray-500">Admin dashboard</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <NavSection title="Public" items={publicNav} close={close} />
        {isAuthenticated && <NavSection title="User" items={userNav} close={close} />}
        {user?.role === "admin" && <NavSection title="Admin" items={adminNav} close={close} />}
      </nav>

      <div className="border-t border-gray-200 p-4">
        {isAuthenticated && user ? (
          <div className="space-y-3">
            <Link
              to={`/users/${user.id}`}
              onClick={close}
              className="flex items-center gap-3 rounded-lg p-2 -m-2 transition-colors hover:bg-gray-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                {user.username.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">{user.username}</p>
                <RoleBadge role={user.role} />
              </div>
            </Link>
            <Button
              variant="secondary"
              className="w-full"
              onClick={async () => {
                await logout();
                navigate("/login");
              }}
            >
              Logout
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => navigate("/login")}>Login</Button>
            <Button onClick={() => navigate("/register")}>Register</Button>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebar}</div>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-gray-900/40" aria-label="Close sidebar" onClick={close} />
          <div className="relative h-full">{sidebar}</div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="px-3 lg:hidden" onClick={() => setOpen(true)} aria-label="Open sidebar">Menu</Button>
            <span className="text-sm font-medium text-gray-500">PulseNet control panel</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to={`/users/${user.id}`} className="hidden text-sm font-medium text-gray-700 hover:text-gray-950 sm:inline">
                  {user.username}
                </Link>
                <RoleBadge role={user.role} />
              </>
            ) : (
              <Badge tone="gray">guest</Badge>
            )}
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
