import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { IAuthAPIService } from "../../api_services/auth/IAuthAPIService";
import { Button, Card, ErrorMessage, Input } from "../ui/UI";
import { validateLogin } from "../../helpers/validators";

export function LoginForm({ authApi }: { authApi: IAuthAPIService }) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const validation = validateLogin(username, password);
    if (!validation.valid) {
      setError(validation.message ?? "Invalid login input.");
      return;
    }

    setLoading(true);
    const response = await authApi.login(username.trim(), password);
    setLoading(false);

    if (!response.success || !response.data) {
      setError(response.message ?? "Invalid credentials.");
      return;
    }

    login(response.data);
  };

  return (
    <Card className="w-full max-w-md p-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">PN</div>
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-500">Sign in to PulseNet</p>
      </div>

      {error && <div className="mb-5"><ErrorMessage message={error} /></div>}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Username</label>
          <Input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="your_username" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
          <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
        </div>
        <button type="submit" disabled={loading}
          className="mt-2 bg-white hover:bg-white/90 disabled:opacity-50 text-black font-semibold rounded-xl py-3 text-sm transition-colors">
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <button
           type="button"
           onClick={() => navigate("/communities")}
           className="border border-white/10 text-white/50 hover:text-white hover:bg-white/5 font-medium rounded-xl py-3 text-sm transition-colors"
           >
           Continue as guest
          </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Do not have an account? <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700">Create one</Link>
      </p>
    </Card>
  );
}
