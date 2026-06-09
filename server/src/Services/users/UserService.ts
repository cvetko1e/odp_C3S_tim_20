import { IUserService } from "../../Domain/services/users/IUserService";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { UserDto } from "../../Domain/DTOs/users/UserDto";
import { UserRole } from "../../Domain/enums/UserRole";
import { ServiceResult } from '../../Domain/types/ServiceResult';
import { UpdateUserProfileDto } from "../../Domain/DTOs/users/UpdateUserProfileDto";
import { User } from "../../Domain/models/User";


export class UserService implements IUserService {
  public constructor(private readonly userRepo: IUserRepository) {}

  private toDto(u: User): UserDto {
    return new UserDto(
      u.id,
      u.username,
      u.email,
      u.role,
      u.isActive,
      u.followersCount,
      u.followingCount,
      u.firstName,
      u.lastName,
      u.bio ?? "",
      u.profileImage ?? "",
    );
  }

  public async getAll(): Promise<UserDto[]> {
    const users = await this.userRepo.findAll();
    return users.map((u) => this.toDto(u));
  }
  public async getById(id: number): Promise<ServiceResult<UserDto>> {
    const u = await this.userRepo.findById(id);
    if (u.id === 0) {
      return { success: false, status: 404, message: "User not found", data: null };
    }
    return { success: true, status: 200, message: "OK", data: this.toDto(u) };
  }

  public async updateMe(id: number, dto: UpdateUserProfileDto): Promise<ServiceResult<UserDto>> {
    const current = await this.userRepo.findById(id);
    if (current.id === 0 || current.isActive === 0) {
      return { success: false, status: 404, message: "User not found", data: null };
    }

    const nextUsername = dto.username ?? current.username;
    const nextEmail = dto.email ?? current.email;

    const byUsername = await this.userRepo.findByUsername(nextUsername);
    if (byUsername.id !== 0 && byUsername.id !== id) {
      return { success: false, status: 409, message: "Username already taken", data: null };
    }

    const byEmail = await this.userRepo.findByEmail(nextEmail);
    if (byEmail.id !== 0 && byEmail.id !== id) {
      return { success: false, status: 409, message: "Email already taken", data: null };
    }

    const merged = new UpdateUserProfileDto(
      nextUsername,
      dto.firstName ?? current.firstName,
      dto.lastName ?? current.lastName,
      nextEmail,
      dto.bio ?? current.bio ?? "",
      dto.profileImage ?? current.profileImage ?? "",
    );

    const ok = await this.userRepo.updateProfile(id, merged);
    if (!ok) {
      return { success: false, status: 500, message: "Failed to update profile", data: null };
    }

    const updated = await this.userRepo.findById(id);
    return { success: true, status: 200, message: "Profile updated", data: this.toDto(updated) };
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
