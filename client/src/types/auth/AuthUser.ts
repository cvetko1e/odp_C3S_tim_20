export type AuthRole = "guest" | "user" | "admin";

export type AuthUser = {
  id: number;
  username: string;
  role: Exclude<AuthRole, "guest">;
};