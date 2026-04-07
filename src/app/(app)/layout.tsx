import { Sidebar } from "@/components/ui/sidebar";
import { requireAuth } from "@/lib/requireAuth";
import { getProfile } from "@/services/profile";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();
  const profile = await getProfile(user.id);

  return (
    <div className="flex min-h-screen">
      <Sidebar firstName={profile?.firstName} lastName={profile?.lastName} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 pt-8 pb-16">{children}</div>
      </main>
    </div>
  );
}
