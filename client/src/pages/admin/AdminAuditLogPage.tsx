import { useEffect, useState } from "react";
import { PageHeader, Table, TableHead, Empty, ErrorBox, Spinner, Pagination } from "../../components/ui/UI";
import { auditApi } from "../../api_services/audit/AuditAPIService";
import type { AuditLogDto } from "../../models/audit/AuditTypes";

const ACTION_COLORS: Record<string, string> = {
  REGISTER: "text-green-700",
  LOGIN: "text-blue-700",
  LOGOUT: "text-gray-500",
  CREATE_COMMUNITY: "text-indigo-700",
  JOIN_COMMUNITY: "text-indigo-700",
  CREATE_POST: "text-yellow-700",
  DELETE_POST: "text-red-700",
  LIKE_POST: "text-red-700",
  COMMENT_POST: "text-yellow-700",
  FOLLOW_USER: "text-blue-700",
  ROLE_CHANGE: "text-yellow-800",
  FAILOVER: "text-red-700",
};

const PAGE_SIZE = 50;

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLogDto[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      auditApi.getLogs(page, PAGE_SIZE)
        .then((response) => {
          if (response.success) setLogs(response.data ?? []);
          else setError(response.message);
        })
        .catch(() => setError("Failed to load audit logs"))
        .finally(() => setLoading(false));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [page]);

  return (
    <div>
      <PageHeader eyebrow="Admin" title="Audit Log" />
      {error && <div className="mb-4"><ErrorBox message={error} /></div>}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : logs.length === 0 ? (
        <Empty message="No audit logs found" />
      ) : (
        <>
          <Table>
            <TableHead columns={["ID", "Action", "User ID", "Entity", "IP", "Time"]} />
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono text-xs text-gray-500">{log.id}</td>
                  <td className="px-5 py-3">
                    <span className={`font-mono text-xs font-medium ${ACTION_COLORS[log.action] ?? "text-gray-600"}`}>{log.action}</span>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-gray-500">{log.userId ?? "-"}</td>
                  <td className="px-5 py-3 text-xs text-gray-600">
                    {log.entity ? `${log.entity}${log.entityId ? ` #${log.entityId}` : ""}` : "-"}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-gray-500">{log.ipAddress ?? "-"}</td>
                  <td className="px-5 py-3 text-xs text-gray-500">{log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={page} total={logs.length < PAGE_SIZE ? (page - 1) * PAGE_SIZE + logs.length : page * PAGE_SIZE + 1} pageSize={PAGE_SIZE} onChange={setPage} />
        </>
      )}
    </div>
  );
}
