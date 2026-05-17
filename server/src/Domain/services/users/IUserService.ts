import { UserDto } from "../../DTOs/users/UserDto";
import { UserRole } from "../../enums/UserRole";

export interface IUserService {
  getAll(): Promise<UserDto[]>;
  getById(id: number): Promise<UserDto | null>;
  deactivate(id: number): Promise<boolean>;
  changeRole(id: number, role: UserRole): Promise<boolean>;
}
