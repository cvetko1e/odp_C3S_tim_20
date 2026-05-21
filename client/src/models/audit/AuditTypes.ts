export type AuditLogDto = {
  id: number;
  userId: number | null;
  action: string;
  entity: string | null;
  entityId: number | null;
  meta: string | null;
  ipAddress: string | null;
  createdAt: string | null;
};
