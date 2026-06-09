import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="inline-block animate-spin text-blue-600">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 60" />
    </svg>
  );
}

export function Loading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white p-8 text-sm text-gray-500 shadow-sm">
      <Spinner size={18} />
      <span>{message}</span>
    </div>
  );
}

export function Empty({ message = "No data" }: { message?: string }) {
  return <EmptyState message={message} />;
}

export function EmptyState({ message = "No data" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 py-14 text-center shadow-sm">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-lg font-semibold text-gray-400">PN</div>
      <p className="text-sm font-medium text-gray-700">{message}</p>
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return <ErrorMessage message={message} />;
}

export function ErrorMessage({ message }: { message: string }) {
  return <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>;
}

export function SuccessBox({ message }: { message: string }) {
  return <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>;
}

export function Badge({ children, tone = "gray" }: { children: ReactNode; tone?: "gray" | "blue" | "green" | "yellow" | "red" | "indigo" }) {
  const styles: Record<string, string> = {
    gray: "bg-gray-100 text-gray-700 border-gray-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    yellow: "bg-yellow-50 text-yellow-800 border-yellow-200",
    red: "bg-red-50 text-red-700 border-red-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };
  return <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium ${styles[tone]}`}>{children}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone = normalized.includes("health") || normalized === "active" || normalized === "completed" ? "green"
    : normalized.includes("degraded") || normalized === "pending" ? "yellow"
      : normalized.includes("unreachable") || normalized.includes("offline") || normalized === "cancelled" || normalized === "inactive" ? "red"
        : "gray";
  return <Badge tone={tone}>{status}</Badge>;
}

export function NodeBadge({ status }: { status: string }) {
  return <StatusBadge status={status} />;
}

export function RoleBadge({ role }: { role: string }) {
  return <Badge tone={role === "admin" ? "indigo" : "gray"}>{role}</Badge>;
}

export function Button({ className = "", variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" }) {
  const styles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "text-gray-600 hover:bg-gray-100 focus:ring-blue-500",
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    />
  );
}

export function ConfirmButton({ confirmMessage, onConfirm, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { confirmMessage: string; onConfirm: () => void; children: ReactNode }) {
  return (
    <Button
      {...props}
      onClick={() => {
        if (window.confirm(confirmMessage)) onConfirm();
      }}
    >
      {children}
    </Button>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${props.className ?? ""}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${props.className ?? ""}`} />;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>{children}</div>;
}

export function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <Card className="p-5">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className={`mt-2 text-3xl font-semibold tracking-tight ${color ?? "text-gray-900"}`}>{value}</p>
      {sub && <p className="mt-1 text-sm text-gray-500">{sub}</p>}
    </Card>
  );
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">{children}</table>
      </div>
    </div>
  );
}

export function TableHead({ columns }: { columns: string[] }) {
  return (
    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
      <tr>
        {columns.map((column) => (
          <th key={column} className="px-5 py-3 font-semibold">{column}</th>
        ))}
      </tr>
    </thead>
  );
}

export function Pagination({ page, total, pageSize, onChange }: { page: number; total: number; pageSize: number; onChange: (p: number) => void }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return <></>;
  return (
    <div className="mt-5 flex items-center gap-3 text-sm text-gray-500">
      <Button variant="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</Button>
      <span>{page} / {totalPages}</span>
      <Button variant="secondary" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next</Button>
      <span>{total} total</span>
    </div>
  );
}

export function PageHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">{title}</h1>
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
