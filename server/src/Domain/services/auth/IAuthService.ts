import { AuthUserDto } from "../../DTOs/auth/AuthUserDto";

export type RegisterInput = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  bio: string | null;
  profileImage: string | null;
};

export interface IAuthService {
  login(username: string, password: string): Promise<AuthUserDto>;
  register(input: RegisterInput): Promise<AuthUserDto>;
}
