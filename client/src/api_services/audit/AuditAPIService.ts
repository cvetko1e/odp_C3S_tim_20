import axios from "axios";
import type { IAuditAPIService, ApiResponse } from "./IAuditAPIService";
import type { AuditLogDto } from "../../models/audit/AuditTypes";
import { readItem } from "../../helpers/local_storage";

const BASE = import.meta.env.VITE_API_URL + "audits";

const authHeader = () => {
  const token = readItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const err = <T>(e: unknown, fallback: string): ApiResponse<T> => ({
  success: false,
  message: axios.isAxiosError(e)
    ? (e.response?.data as { message?: string })?.message ?? fallback
    : fallback,
});

export const auditApi: IAuditAPIService = {
  async getLogs(page = 1, limit = 50) {
    return axios
      .get<ApiResponse<AuditLogDto[]>>(`${BASE}/logs`, {
        headers: authHeader(),
        params: { page, limit },
      })
      .then((r) => r.data)
      .catch((e) => err(e, "Failed to load audit logs"));
  },
};
