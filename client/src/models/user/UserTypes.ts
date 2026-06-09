export type UserDto = {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: number;
  followersCount: number;
  followingCount: number;
  firstName: string;
  lastName: string;
  bio: string;
  profileImage: string;
};

export type UpdateUserProfilePayload = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  profileImage: string;
};
