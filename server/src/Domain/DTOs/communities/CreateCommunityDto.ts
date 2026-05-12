import { CommunityType } from "../../models/Community";

export class CreateCommunityDto {
  constructor(
    public name: string = "",
    public description: string | null = null,
    public rules: string | null = null,
    public avatarUrl: string | null = null,
    public type: CommunityType = "public",
  ) {}
}
