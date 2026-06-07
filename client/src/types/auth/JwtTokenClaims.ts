import type { AuthUser } from "./AuthUser";

export type JwtTokenClaims = {
  id: number;
  username: string;
  role: AuthUser["role"];
  exp?: number;
};
