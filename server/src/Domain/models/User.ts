import { UserRole } from "../enums/UserRole";

export class User {
  constructor(
    public id: number        = 0,
    public username: string  = "",
    public email: string     = "",
    public role: UserRole    = UserRole.USER,
    public passwordHash: string = "",
    public isActive: number  = 1,
    public firstName: string = "",
    public lastName: string = "",
    public bio: string | null = null,
    public profileImage: string | null = null,
  ) {}
}
