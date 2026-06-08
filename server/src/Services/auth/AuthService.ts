import bcrypt from "bcryptjs";
import { IAuthService, RegisterInput } from "../../Domain/services/auth/IAuthService";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { AuthUserDto } from "../../Domain/DTOs/auth/AuthUserDto";
import { UserRole } from "../../Domain/enums/UserRole";
import { User } from "../../Domain/models/User";

export class AuthService implements IAuthService {
  private readonly saltRounds = parseInt(process.env.SALT_ROUNDS ?? "10", 10);

  public constructor(private readonly userRepo: IUserRepository) {}

  async login(username: string, password: string): Promise<AuthUserDto> {
    const user = await this.userRepo.findByUsername(username);
    if (user.id === 0 || user.isActive === 0) return new AuthUserDto();
    const match = await bcrypt.compare(password, user.passwordHash).catch(() => false);
    if (!match) return new AuthUserDto();
    return new AuthUserDto(user.id, user.username, user.role);
  }

  async register(input: RegisterInput): Promise<AuthUserDto> {
    const byName = await this.userRepo.findByUsername(input.username);
    if (byName.id !== 0) return new AuthUserDto();
    const byEmail = await this.userRepo.findByEmail(input.email);
    if (byEmail.id !== 0) return new AuthUserDto();
    const hash = await bcrypt.hash(input.password, this.saltRounds).catch(() => "");
    if (!hash) return new AuthUserDto();
    const created = await this.userRepo.create(new User(
      0,
      input.username,
      input.email,
      UserRole.USER,
      hash,
      1,
      input.firstName,
      input.lastName,
      input.bio,
      input.profileImage,
    ));
    if (created.id === 0) return new AuthUserDto();
    return new AuthUserDto(created.id, created.username, created.role);
  }
}
