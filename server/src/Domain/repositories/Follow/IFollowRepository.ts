import { UserDto } from "../../DTOs/users/UserDto";

export interface IFollowRepository {
  follow(followerId: number, followingId: number): Promise<boolean>;
  unfollow(followerId: number, followingId: number): Promise<boolean>;
  isFollowing(followerId: number, followingId: number): Promise<boolean>;
  getFollowers(userId: number): Promise<UserDto[]>;
  getFollowing(userId: number): Promise<UserDto[]>;
  getFollowerCount(userId: number): Promise<number>;
  getFollowingCount(userId: number): Promise<number>;
  searchUsers(query: string, requesterId: number): Promise<UserDto[]>;
}
