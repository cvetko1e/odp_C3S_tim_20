export class UpdateUserProfileDto {
  public constructor(
    public username?: string,
    public firstName?: string,
    public lastName?: string,
    public email?: string,
    public bio?: string,
    public profileImage?: string,
  ) {}
}
