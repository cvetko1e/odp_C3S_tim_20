/** Per-node health snapshot returned by the /health/db endpoint */
export interface NodeHealthInfo {
  name:              string;
  role:              string;
  host:              string;
  port:              number;
  status:            string;
  responseTimeMs:    number;
  lastCheck:         string;
  successfulQueries: number;
  failedQueries:     number;
}

/** Top-level health response */
export interface HealthStatus {
  /** Overall cluster status: healthy | degraded | unhealthy */
  status:    "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  /** Server uptime in seconds */
  uptime:    number;
  nodes:     NodeHealthInfo[];
}
