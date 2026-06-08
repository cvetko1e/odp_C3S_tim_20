import { Link } from "react-router-dom";
import { Card } from "../../components/ui/UI";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-md p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-red-600">403</p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">Access denied</h1>
        <p className="mt-3 text-sm text-gray-500">Your account does not have permission to open this page.</p>
        <Link to="/communities" className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Back to communities
        </Link>
      </Card>
    </main>
  );
}
