import { useState } from "react";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { IAuthAPIService } from "../../api_services/auth/IAuthAPIService";
import type { RegisterPayload } from "../../types/auth/RegisterPayload";

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

const validate = (form: RegisterFormState): string => {
  if (!/^[a-zA-Z0-9-]{3,40}$/.test(form.username.trim())) return "Username must be 3-40 letters, numbers, or dashes.";
  if (form.firstName.trim().length < 2 || form.firstName.trim().length > 100) return "First name must be 2-100 characters.";
  if (form.lastName.trim().length < 2 || form.lastName.trim().length > 100) return "Last name must be 2-100 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Enter a valid email address.";
  if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password)) return "Password must be 8+ characters with one uppercase letter and one number.";
  if (form.bio.trim().length > 300) return "Bio must be 300 characters or fewer.";
  return "";
};

export function RegisterForm({ authApi }: { authApi: IAuthAPIService }) {
  const { login } = useAuth();
  const [form, setForm] = useState<RegisterFormState>(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const setText = (key: keyof Omit<RegisterFormState, "profileImage">) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const setImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setForm((f) => ({ ...f, profileImage: null }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Profile image must be an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setForm((f) => ({ ...f, profileImage: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const validationMessage = validate(form);
    if (validationMessage) {
      setError(validationMessage);
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
    const res = await authApi.register(payload);
    setLoading(false);

    if (!res.success || !res.data) {
      setError(res.message ?? "Registration failed");
      return;
    }

    login(res.data);
  };

  return (
    <div className="w-full max-w-lg">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-white/8 border border-white/12 flex items-center justify-center mx-auto mb-4">
          <span className="text-white/60 text-lg">⬢</span>
        </div>
        <h1 className="text-xl font-semibold text-white">Create account</h1>
        <p className="text-sm text-white/35 mt-1">Register to get started</p>
      </div>

      {error && (
        <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-300 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/40 mb-2 font-medium">First name</label>
            <input value={form.firstName} onChange={setText("firstName")} required className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-2 font-medium">Last name</label>
            <input value={form.lastName} onChange={setText("lastName")} required className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-2 font-medium">Username</label>
          <input value={form.username} onChange={setText("username")} required className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors" />
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-2 font-medium">Email</label>
          <input type="email" value={form.email} onChange={setText("email")} required className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors" />
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-2 font-medium">Password</label>
          <input type="password" value={form.password} onChange={setText("password")} required placeholder="Min 8 chars, 1 uppercase, 1 number" className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors" />
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-2 font-medium">Bio</label>
          <textarea value={form.bio} onChange={setText("bio")} maxLength={300} rows={3} className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors resize-none" />
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-2 font-medium">Profile image</label>
          <input type="file" accept="image/*" onChange={setImage} className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-white/60 text-sm file:mr-4 file:border-0 file:bg-white/10 file:text-white file:rounded-lg file:px-3 file:py-1.5 focus:outline-none focus:border-white/30 transition-colors" />
        </div>

        <button type="submit" disabled={loading} className="mt-2 bg-white hover:bg-white/90 disabled:opacity-50 text-black font-semibold rounded-xl py-3 text-sm transition-colors">
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-center text-white/30 text-sm mt-6">
        Already have an account?{" "}
        <a href="/login" className="text-white/60 hover:text-white transition-colors">Sign in</a>
      </p>
    </div>
  );
}
