import axios from "axios";
import { readItem } from "../../helpers/local_storage";

const BASE = import.meta.env.VITE_API_URL + "health";

const authHeader = () => {
  const token = readItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export type DbNodeHealth = {
  name: string;
  role: string;
  host: string;
  port: number;
  status: string;
  responseTimeMs: number;
  lastCheck: string;
  successfulQueries: number;
  failedQueries: number;
};

export type DbHealth = {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  nodes: DbNodeHealth[];
};

export const healthApi = {
  async getDbHealth() {
    const res = await axios.get<{ success: boolean; data: DbHealth }>(`${BASE}/db`, {
      headers: authHeader(),
    });
    return res.data;
  },

  async failover() {
    const res = await axios.post(`${BASE}/failover`, {}, {
      headers: authHeader(),
    });
    return res.data;
  },
};