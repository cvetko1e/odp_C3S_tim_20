import { User } from "../../models/User";
import { UserRole } from "../../enums/UserRole";
import { UpdateUserProfileDto } from "../../DTOs/users/UpdateUserProfileDto";

export interface IUserRepository {
  findById(id: number): Promise<User>;
  findByUsername(username: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  findAll(): Promise<User[]>;
  create(user: User): Promise<User>;
  update(user: User): Promise<boolean>;
  updateProfile(id: number, dto: UpdateUserProfileDto): Promise<boolean>;
  deactivate(id: number): Promise<boolean>;
  changeRole(id: number, role: UserRole): Promise<boolean>;
}
