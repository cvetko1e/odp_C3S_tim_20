import { CommunityType } from "../../models/Community";

export class UpdateCommunityDto {
  constructor(
    public name: string | undefined = undefined,
    public description: string | null | undefined = undefined,
    public rules: string | null | undefined = undefined,
    public avatarUrl: string | null | undefined = undefined,
    public type: CommunityType | undefined = undefined,
  ) {}
}
