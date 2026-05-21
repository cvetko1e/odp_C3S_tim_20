import { useEffect, useState } from "react";
import { PageHeader, Table, TableHead, Empty, ErrorBox, Spinner, Pagination } from "../../components/ui/UI";
import { auditApi } from "../../api_services/audit/AuditAPIService";
import type { AuditLogDto } from "../../models/audit/AuditTypes";

const ACTION_COLORS: Record<string, string> = {
  REGISTER:         "text-emerald-400",
  LOGIN:            "text-sky-400",
  LOGOUT:           "text-white/40",
  CREATE_COMMUNITY: "text-violet-400",
  JOIN_COMMUNITY:   "text-violet-300",
  CREATE_POST:      "text-amber-400",
  DELETE_POST:      "text-red-400",
  LIKE_POST:        "text-pink-400",
  COMMENT_POST:     "text-amber-300",
  FOLLOW_USER:      "text-sky-300",
  ROLE_CHANGE:      "text-amber-500",
  FAILOVER:         "text-red-500",
};

const PAGE_SIZE = 50;

export default function AdminAuditLogPage() {
  const [logs, setLogs]   = useState<AuditLogDto[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage]   = useState(1);

  useEffect(() => {
    setLoading(true);
    auditApi.getLogs(page, PAGE_SIZE)
      .then((res) => {
        if (res.success) setLogs(res.data ?? []);
        else setError(res.message);
      })
      .catch(() => setError("Failed to load audit logs"))
      .finally(() => setLoading(false));
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
                <tr key={log.id} className="border-t border-white/4 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3 text-white/20 font-mono text-xs">{log.id}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-mono font-medium ${ACTION_COLORS[log.action] ?? "text-white/50"}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-white/30 font-mono text-xs">{log.userId ?? "—"}</td>
                  <td className="px-5 py-3 text-white/30 text-xs">
                    {log.entity ? `${log.entity}${log.entityId ? ` #${log.entityId}` : ""}` : "—"}
                  </td>
                  <td className="px-5 py-3 text-white/20 font-mono text-xs">{log.ipAddress ?? "—"}</td>
                  <td className="px-5 py-3 text-white/25 text-xs">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination
            page={page}
            total={logs.length < PAGE_SIZE ? (page - 1) * PAGE_SIZE + logs.length : page * PAGE_SIZE + 1}
            pageSize={PAGE_SIZE}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
