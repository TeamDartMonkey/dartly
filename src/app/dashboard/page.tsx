import { LogoutButton } from "@/components/dashboard/logout-button";

export default function DashboardPage() {
  return (
    <main>
      <p>test</p>
      <LogoutButton />
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50 mb-2">Dashboard</h1>
        <p className="text-sm text-zinc-400">
          Your job board will live here.
        </p>
      </div>
    </main>
  );
}