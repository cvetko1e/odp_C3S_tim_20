import { IUserService } from "../../Domain/services/users/IUserService";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { UserDto } from "../../Domain/DTOs/users/UserDto";
import { UserRole } from "../../Domain/enums/UserRole";


export class UserService implements IUserService {
  public constructor(private readonly userRepo: IUserRepository) {}

  public async getAll(): Promise<UserDto[]> {
    const users = await this.userRepo.findAll();
    return users.map((u) => new UserDto(u.id, u.username, u.email, u.role, u.isActive));
  }

  public async getById(id: number): Promise<UserDto | null> {
    const u = await this.userRepo.findById(id);
    if (u.id === 0) return null;
    return new UserDto(u.id, u.username, u.email, u.role, u.isActive);
  }

  public async deactivate(id: number): Promise<boolean> {
    return this.userRepo.deactivate(id);
  }

  public async changeRole(id: number, role: UserRole): Promise<boolean> {
    if (role !== UserRole.ADMIN && role !== UserRole.USER) return false;
    return this.userRepo.changeRole(id, role);
  }

}
