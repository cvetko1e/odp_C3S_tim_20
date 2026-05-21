import type { AuditLogDto } from "../../models/audit/AuditTypes";

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface IAuditAPIService {
  getLogs(page?: number, limit?: number): Promise<ApiResponse<AuditLogDto[]>>;
}
