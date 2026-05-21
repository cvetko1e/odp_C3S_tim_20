import type { UserDto } from "../../models/user/UserTypes";

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface IFollowAPIService {
  follow(userId: number): Promise<ApiResponse<void>>;
  unfollow(userId: number): Promise<ApiResponse<void>>;
  getFollowers(userId: number): Promise<ApiResponse<UserDto[]>>;
  getFollowing(userId: number): Promise<ApiResponse<UserDto[]>>;
  searchUsers(query: string): Promise<ApiResponse<UserDto[]>>;
}
