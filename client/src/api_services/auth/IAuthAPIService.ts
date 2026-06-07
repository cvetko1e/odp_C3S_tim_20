import type { AuthResponse } from "../../types/auth/AuthResponse";
import type { RegisterPayload } from "../../types/auth/RegisterPayload";

export interface IAuthAPIService {
  login(username: string, password: string): Promise<AuthResponse>;
  register(payload: RegisterPayload): Promise<AuthResponse>;
  logout(token: string): Promise<AuthResponse>;
}
