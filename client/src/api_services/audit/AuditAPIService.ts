import axios from "axios";
import type { IAuditAPIService, ApiResponse } from "./IAuditAPIService";
import type { AuditLogDto } from "../../models/audit/AuditTypes";
import { readItem } from "../../helpers/local_storage";

const BASE = import.meta.env.VITE_API_URL + "audits";

const authHeader = () => {
  const token = readItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const auditApi: IAuditAPIService = {
  async getLogs(page = 1, limit = 50): Promise<ApiResponse<AuditLogDto[]>> {
    try {
      const response = await axios.get<ApiResponse<AuditLogDto[]>>(`${BASE}/logs`, {
        headers: authHeader(),
        params: { page, limit },
      });
      return response.data;
    } catch {
      return { success: false, message: "Failed to load audit logs" };
    }
  },
};
