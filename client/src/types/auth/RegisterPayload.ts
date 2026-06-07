export type RegisterPayload = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "user";
  bio: string | null;
  profileImage: string | null;
};
