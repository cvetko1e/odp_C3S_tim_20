import { IUserService } from "../../Domain/services/users/IUserService";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { UserDto } from "../../Domain/DTOs/users/UserDto";
import { UserRole } from "../../Domain/enums/UserRole";
import { ServiceResult } from '../../Domain/types/ServiceResult';


export class UserService implements IUserService {
  public constructor(private readonly userRepo: IUserRepository) {}

  public async getAll(): Promise<UserDto[]> {
    const users = await this.userRepo.findAll();
    return users.map((u) => new UserDto(u.id, u.username, u.email, u.role, u.isActive));
  }
  public async getById(id: number): Promise<ServiceResult<UserDto>> {
    const u = await this.userRepo.findById(id);
    if (u.id === 0) {
      return { success: false, status: 404, message: "User not found", data: null };
    }
    return { success: true, status: 200, message: "OK", data: new UserDto(u.id, u.username, u.email, u.role, u.isActive, u.followersCount, u.followingCount) };
  }
 


  public async deactivate(id: number): Promise<ServiceResult<boolean>> {
    const ok = await this.userRepo.deactivate(id);
    return {
      success: ok,
      status: ok ? 200 : 404,
      message: ok ? "User deactivated" : "User not found",
      data: ok,
    };
  }

  public async changeRole(id: number, role: UserRole): Promise<ServiceResult<boolean>> {
    if (role !== UserRole.ADMIN && role !== UserRole.USER) {
      return { success: false, status: 400, message: "Invalid role", data: false };
    }

    const ok = await this.userRepo.changeRole(id, role);
    return {
      success: ok,
      status: ok ? 200 : 404,
      message: ok ? "Role changed" : "User not found",
      data: ok,
    };
  }

}
