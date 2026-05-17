import { useEffect, useState } from "react";
import { PageHeader, Table, TableHead, RoleBadge, Empty, ErrorBox, SuccessBox } from "../../components/ui/UI";
import { usersApi } from "../../api_services/users/UsersAPIService";
import type { UserDto } from "../../models/user/UserTypes";

export default function UsersPage() {
    const [users, setUsers] = useState<UserDto[]>([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState<number | null>(null);

    useEffect(() => {
        usersApi.getAll()
            .then((res) => { if (res.success) setUsers(res.data ?? []); else setError(res.message); })
            .catch(() => setError("Failed to load users"));
    }, []);

    const handleRoleToggle = async (user: UserDto) => {
        const newRole = user.role === "admin" ? "user" : "admin";
        setLoading(user.id);
        setError("");
        setSuccess("");
        const res = await usersApi.changeRole(user.id, newRole);
        if (res.success) {
            setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: newRole } : u));
            setSuccess(`${user.username} is now ${newRole}`);
        } else {
            setError(res.message);
        }
        setLoading(null);
    };

    const handleDeactivate = async (user: UserDto) => {
        if (!window.confirm(`Deactivate ${user.username}?`)) return;
        setLoading(user.id);
        const res = await usersApi.deactivate(user.id);
        if (res.success) {
            setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isActive: 0 } : u));
            setSuccess(`${user.username} deactivated`);
        } else {
            setError(res.message);
        }
        setLoading(null);
    };

    return (
        <div>
            <PageHeader eyebrow="Admin" title="Users" />
            {error && <div className="mb-4"><ErrorBox message={error} /></div>}
            {success && <div className="mb-4"><SuccessBox message={success} /></div>}

            {users.length === 0 && !error ? (
                <Empty message="No users found" />
            ) : (
                <Table>
                    <TableHead columns={["ID", "Username", "Email", "Role", "Status", "Actions"]} />
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id} className="border-t border-white/4 hover:bg-white/2 transition-colors">
                                <td className="px-5 py-3.5 text-white/30 font-mono text-xs">{u.id}</td>
                                <td className="px-5 py-3.5 text-white/80 text-sm">{u.username}</td>
                                <td className="px-5 py-3.5 text-white/40 text-sm">{u.email}</td>
                                <td className="px-5 py-3.5"><RoleBadge role={u.role} /></td>
                                <td className="px-5 py-3.5">
                                    <span className={`text-xs ${u.isActive ? "text-emerald-400" : "text-white/20"}`}>
                                        {u.isActive ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleRoleToggle(u)}
                                            disabled={loading === u.id}
                                            className="px-2.5 py-1 text-xs border border-white/10 text-white/40 rounded-lg hover:border-amber-500/30 hover:text-amber-400 disabled:opacity-30 transition-colors"
                                        >
                                            {u.role === "admin" ? "→ user" : "→ admin"}
                                        </button>
                                        {u.isActive === 1 && (
                                            <button
                                                onClick={() => handleDeactivate(u)}
                                                disabled={loading === u.id}
                                                className="px-2.5 py-1 text-xs border border-white/10 text-white/40 rounded-lg hover:border-red-500/30 hover:text-red-400 disabled:opacity-30 transition-colors"
                                            >
                                                Deactivate
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </div>
    );
}
