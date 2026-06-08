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
                            <tr key={u.id} className="border-t border-gray-200 hover:bg-gray-50">
                                <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{u.id}</td>
                                <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{u.username}</td>
                                <td className="px-5 py-3.5 text-sm text-gray-600">{u.email}</td>
                                <td className="px-5 py-3.5"><RoleBadge role={u.role} /></td>
                                <td className="px-5 py-3.5">
                                    <span className={`text-xs font-medium ${u.isActive ? "text-green-700" : "text-gray-400"}`}>
                                        {u.isActive ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleRoleToggle(u)}
                                            disabled={loading === u.id}
                                            className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-30"
                                        >
                                            {u.role === "admin" ? "→ user" : "→ admin"}
                                        </button>
                                        {u.isActive === 1 && (
                                            <button
                                                onClick={() => handleDeactivate(u)}
                                                disabled={loading === u.id}
                                                className="rounded-lg border border-red-200 px-2.5 py-1 text-xs text-red-700 transition-colors hover:bg-red-50 disabled:opacity-30"
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
