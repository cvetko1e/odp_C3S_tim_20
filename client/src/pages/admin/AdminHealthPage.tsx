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

  const fetchHealth = async (): Promise<DbHealth | undefined> => {
    const response = await healthApi.getDbHealth();

    if (!response.success || !response.data) {
      return undefined;
    }

    return response.data;
  };

  const refreshHealth = async () => {
    try {
      setError("");
      const nextHealth = await fetchHealth();
      if (nextHealth) {
        setHealth(nextHealth);
      } else {
        setError("Failed to load DB health status");
      }
    } catch {
      setError("Failed to load DB health status");
    }
  };

  useEffect(() => {
    let cancelled = false;

    void fetchHealth()
      .then((nextHealth) => {
        if (cancelled) return;
        if (nextHealth) {
          setHealth(nextHealth);
        } else {
          setError("Failed to load DB health status");
        }
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
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
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
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
                  <tr key={node.name} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                    <td className="px-5 py-3.5 font-medium text-gray-900">
                      {node.name}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {node.role}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {node.host}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {node.port}
                    </td>
                    <td className="px-5 py-3.5">
                      <NodeBadge status={node.status} />
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {node.responseTimeMs >= 0 ? `${node.responseTimeMs}ms` : "-"}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
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
