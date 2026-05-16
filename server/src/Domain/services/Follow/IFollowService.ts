import { UserDto } from "../../DTOs/users/UserDto";
import { ServiceResult } from "../../types/ServiceResult";

export interface IFollowService {
  follow(followerId: number, followingId: number): Promise<ServiceResult<boolean>>;
  unfollow(followerId: number, followingId: number): Promise<ServiceResult<boolean>>;
  getFollowers(userId: number): Promise<UserDto[]>;
  getFollowing(userId: number): Promise<UserDto[]>;
  searchUsers(query: string, requesterId: number): Promise<UserDto[]>;
}
