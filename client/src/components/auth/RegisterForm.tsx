import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { IAuthAPIService } from "../../api_services/auth/IAuthAPIService";
import type { RegisterPayload } from "../../types/auth/RegisterPayload";
import { Button, Card, ErrorMessage, Input, TextArea } from "../ui/UI";
import { validateRegister } from "../../helpers/validators";

type RegisterFormState = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  bio: string;
  profileImage: string | null;
};

const initialForm: RegisterFormState = {
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  bio: "",
  profileImage: null,
};

export function RegisterForm({ authApi }: { authApi: IAuthAPIService }) {
  const { login } = useAuth();
  const [form, setForm] = useState<RegisterFormState>(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const setText = (key: keyof Omit<RegisterFormState, "profileImage">) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const setImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setForm((current) => ({ ...current, profileImage: null }));
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Profile image must be an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") setForm((current) => ({ ...current, profileImage: result }));
    };
    reader.readAsDataURL(file);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const validation = validateRegister(form);
    if (!validation.valid) {
      setError(validation.message ?? "Invalid registration input.");
      return;
    }

    const payload: RegisterPayload = {
      username: form.username.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password,
      role: "user",
      bio: form.bio.trim() ? form.bio.trim() : null,
      profileImage: form.profileImage,
    };

    setLoading(true);
    const response = await authApi.register(payload);
    setLoading(false);

    if (!response.success || !response.data) {
      setError(response.message ?? "Registration failed.");
      return;
    }

    login(response.data);
  };

  return (
    <Card className="w-full max-w-2xl p-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">PN</div>
        <h1 className="text-2xl font-semibold text-gray-900">Create account</h1>
        <p className="mt-1 text-sm text-gray-500">Register with the default user role</p>
      </div>

      {error && <div className="mb-5"><ErrorMessage message={error} /></div>}

      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">First name</label>
            <Input value={form.firstName} onChange={setText("firstName")} required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Last name</label>
            <Input value={form.lastName} onChange={setText("lastName")} required />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Username</label>
            <Input value={form.username} onChange={setText("username")} required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
            <Input type="email" value={form.email} onChange={setText("email")} required />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
          <Input type="password" value={form.password} onChange={setText("password")} required placeholder="Min 8 chars, 1 uppercase, 1 number" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Bio</label>
          <TextArea value={form.bio} onChange={setText("bio")} maxLength={300} rows={3} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Profile image</label>
          <Input type="file" accept="image/*" onChange={setImage} />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account? <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">Sign in</Link>
      </p>
    </Card>
  );
}
