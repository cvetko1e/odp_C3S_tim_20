import { useEffect, useState } from "react";
import {
  ErrorBox,
  NodeBadge,
  PageHeader,
  Spinner,
  StatCard,
  SuccessBox,
  Table,
  TableHead,
} from "../../components/ui/UI";
import { healthApi, type DbHealth } from "../../api_services/health/HealthAPIService";

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function statusColor(status: string): string {
  if (status === "healthy") return "text-emerald-400";
  if (status === "degraded") return "text-yellow-400";
  return "text-red-400";
}

export default function AdminHealthPage() {
  const [health, setHealth] = useState<DbHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [failoverLoading, setFailoverLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchHealth = async (): Promise<DbHealth> => {
    const response = await healthApi.getDbHealth();

    if (!response.success || !response.data) {
      throw new Error("Failed to load DB health status");
    }

    return response.data;
  };

  const refreshHealth = async () => {
    try {
      setError("");
      const nextHealth = await fetchHealth();
      setHealth(nextHealth);
    } catch {
      setError("Failed to load DB health status");
    }
  };

  useEffect(() => {
    let cancelled = false;

    void fetchHealth()
      .then((nextHealth) => {
        if (!cancelled) setHealth(nextHealth);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load DB health status");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleFailover = async () => {
    try {
      setFailoverLoading(true);
      setError("");
      setSuccess("");

      const response = await healthApi.failover();

      if (!response.success) {
        setError(response.message ?? "Failover failed");
        return;
      }

      setSuccess(response.message ?? "Failover completed");
      await refreshHealth();
    } catch {
      setError("Failover failed");
    } finally {
      setFailoverLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <Spinner size={28} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Health Dashboard"
        action={
          <button
            onClick={handleFailover}
            disabled={failoverLoading}
            className="px-4 py-2 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 text-sm hover:bg-red-500/15 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {failoverLoading ? "Running..." : "Manual failover"}
          </button>
        }
      />

      <div className="space-y-4">
        {error && <ErrorBox message={error} />}
        {success && <SuccessBox message={success} />}

        {health && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                label="Cluster status"
                value={health.status}
                color={statusColor(health.status)}
              />
              <StatCard
                label="Uptime"
                value={formatUptime(health.uptime)}
              />
              <StatCard
                label="Last check"
                value={new Date(health.timestamp).toLocaleString()}
              />
            </div>

            <Table>
              <TableHead
                columns={[
                  "Name",
                  "Role",
                  "Host",
                  "Port",
                  "Status",
                  "Response",
                  "Last check",
                ]}
              />
              <tbody>
                {health.nodes.map((node) => (
                  <tr key={node.name} className="border-b border-white/5 last:border-0">
                    <td className="px-5 py-3.5 text-white/80 font-medium">
                      {node.name}
                    </td>
                    <td className="px-5 py-3.5 text-white/45">
                      {node.role}
                    </td>
                    <td className="px-5 py-3.5 text-white/45">
                      {node.host}
                    </td>
                    <td className="px-5 py-3.5 text-white/45">
                      {node.port}
                    </td>
                    <td className="px-5 py-3.5">
                      <NodeBadge status={node.status} />
                    </td>
                    <td className="px-5 py-3.5 text-white/45">
                      {node.responseTimeMs >= 0 ? `${node.responseTimeMs}ms` : "-"}
                    </td>
                    <td className="px-5 py-3.5 text-white/35">
                      {new Date(node.lastCheck).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}
      </div>
    </div>
  );
}
