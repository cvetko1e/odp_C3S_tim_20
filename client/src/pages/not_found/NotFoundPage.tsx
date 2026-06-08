import { Link } from "react-router-dom";
import { Card } from "../../components/ui/UI";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-md p-8 text-center">
        <p className="font-mono text-6xl font-bold text-gray-200">404</p>
        <p className="mb-6 mt-3 text-sm text-gray-500">Page not found.</p>
        <Link to="/communities" className="text-sm font-medium text-blue-600 hover:text-blue-700">Back to communities</Link>
      </Card>
    </main>
  );
}
