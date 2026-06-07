import { UserDto } from "../../DTOs/users/UserDto";
import { UserRole } from "../../enums/UserRole";
import { ServiceResult } from "../../types/ServiceResult";

export interface IUserService {
  getAll(): Promise<UserDto[]>;
  getById(id: number): Promise<ServiceResult<UserDto>>;
  deactivate(id: number): Promise<ServiceResult<boolean>>;
  changeRole(id: number, role: UserRole): Promise<ServiceResult<boolean>>;

  
}
