import { IFollowService } from "../../Domain/services/Follow/IFollowService";
import { IFollowRepository } from "../../Domain/repositories/Follow/IFollowRepository";
import { UserDto } from "../../Domain/DTOs/users/UserDto";
import { ServiceResult } from "../../Domain/types/ServiceResult";

export class FollowService implements IFollowService {
  public constructor(
    private readonly followRepo: IFollowRepository,
  ) {}

  public async follow(followerId: number, followingId: number): Promise<ServiceResult<boolean>> {
    if (followerId === followingId) {
      return { success: false, status: 400, message: "You cannot follow yourself", data: null };
    }

    const alreadyFollowing = await this.followRepo.isFollowing(followerId, followingId);
    if (alreadyFollowing) {
      return { success: false, status: 409, message: "You are already following this user", data: null };
    }

    const ok = await this.followRepo.follow(followerId, followingId);
    if (!ok) {
      return { success: false, status: 500, message: "Failed to follow user", data: null };
    }

    return { success: true, status: 200, message: "Followed successfully", data: true };
  }

  public async unfollow(followerId: number, followingId: number): Promise<ServiceResult<boolean>> {
    if (followerId === followingId) {
      return { success: false, status: 400, message: "You cannot unfollow yourself", data: null };
    }

    const alreadyFollowing = await this.followRepo.isFollowing(followerId, followingId);
    if (!alreadyFollowing) {
      return { success: false, status: 409, message: "You are not following this user", data: null };
    }

    const ok = await this.followRepo.unfollow(followerId, followingId);
    if (!ok) {
      return { success: false, status: 500, message: "Failed to unfollow user", data: null };
    }

    return { success: true, status: 200, message: "Unfollowed successfully", data: true };
  }

  public async getFollowers(userId: number): Promise<UserDto[]> {
    return this.followRepo.getFollowers(userId);
  }

  public async getFollowing(userId: number): Promise<UserDto[]> {
    return this.followRepo.getFollowing(userId);
  }

  public async searchUsers(query: string, requesterId: number): Promise<UserDto[]> {
    return this.followRepo.searchUsers(query, requesterId);
  }
}
