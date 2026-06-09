import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usersApi } from "../../api_services/users/UsersAPIService";
import { followApi } from "../../api_services/follow/FollowAPIService";
import { FollowButton } from "../../components/follow/FollowButton";
import { PageHeader, Spinner, ErrorBox, Card, RoleBadge, Input, TextArea, Button, SuccessBox } from "../../components/ui/UI";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { UpdateUserProfilePayload, UserDto } from "../../models/user/UserTypes";

export const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserDto | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState<UpdateUserProfilePayload>({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    profileImage: "",
  });
  const userId = Number.parseInt(id ?? "0", 10);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setLoading(true);
      const response = await usersApi.getById(userId);
      if (response.success && response.data) {
        setProfile(response.data);
        setForm({
          username: response.data.username,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          bio: response.data.bio,
          profileImage: response.data.profileImage,
        });
        setFollowersCount(response.data.followersCount ?? 0);
        setFollowingCount(response.data.followingCount ?? 0);
        if (currentUser && currentUser.id !== userId) {
          const followers = await followApi.getFollowers(userId);
          if (followers.success && followers.data) setIsFollowing(followers.data.some((user) => user.id === currentUser.id));
        }
      } else {
        setError("User not found.");
      }
      setLoading(false);
    };
    void load();
  }, [userId, currentUser]);

  const handleFollowToggle = (nowFollowing: boolean) => {
    setIsFollowing(nowFollowing);
    setFollowersCount((count) => (nowFollowing ? count + 1 : count - 1));
  };

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const response = await usersApi.updateMe({
      username: form.username.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      bio: form.bio.trim(),
      profileImage: form.profileImage.trim(),
    });

    if (response.success && response.data) {
      setProfile(response.data);
      setForm({
        username: response.data.username,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        email: response.data.email,
        bio: response.data.bio,
        profileImage: response.data.profileImage,
      });
      setSuccess("Profile updated");
    } else {
      setError(response.message || "Failed to update profile");
    }

    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>;
  if (error || !profile) return <div className="mx-auto max-w-2xl"><ErrorBox message={error || "Failed to load user."} /></div>;

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <button onClick={() => navigate(-1)} className="text-xs font-medium text-gray-500 hover:text-gray-900">Back</button>
      <PageHeader eyebrow="Profile" title={`@${profile.username}`} />
      {error && <ErrorBox message={error} />}
      {success && <SuccessBox message={success} />}
      <Card className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-900">{profile.username}</p>
            <p className="text-sm text-gray-500">{profile.email}</p>
            <RoleBadge role={profile.role} />
          </div>
          {!isOwnProfile && currentUser && (
            <FollowButton targetUserId={userId} currentUserId={currentUser.id} initialIsFollowing={isFollowing} onToggle={handleFollowToggle} />
          )}
        </div>
        <div className="flex items-center gap-8 border-t border-gray-200 pt-4">
          <button onClick={() => navigate(`/users/${userId}/followers`)} className="text-center hover:opacity-75">
            <p className="text-lg font-semibold text-gray-900">{followersCount}</p>
            <p className="text-xs text-gray-500">Followers</p>
          </button>
          <button onClick={() => navigate(`/users/${userId}/following`)} className="text-center hover:opacity-75">
            <p className="text-lg font-semibold text-gray-900">{followingCount}</p>
            <p className="text-xs text-gray-500">Following</p>
          </button>
        </div>
      </Card>
      {isOwnProfile && (
        <Card className="p-6">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1 text-sm font-medium text-gray-700">
                Username
                <Input value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} />
              </label>
              <label className="space-y-1 text-sm font-medium text-gray-700">
                Email
                <Input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
              </label>
              <label className="space-y-1 text-sm font-medium text-gray-700">
                First name
                <Input value={form.firstName} onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))} />
              </label>
              <label className="space-y-1 text-sm font-medium text-gray-700">
                Last name
                <Input value={form.lastName} onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))} />
              </label>
            </div>
            <label className="space-y-1 text-sm font-medium text-gray-700">
              Bio
              <TextArea rows={4} value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} />
            </label>
            <label className="space-y-1 text-sm font-medium text-gray-700">
              Profile image
              <Input value={form.profileImage} onChange={(event) => setForm((current) => ({ ...current, profileImage: event.target.value }))} />
            </label>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save profile"}</Button>
          </form>
        </Card>
      )}
    </div>
  );
};
