import { redirect } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { ToastContainer } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase-server";
import { getProfile } from "@/services/profile";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfile(user.id);

  return (
    <div className="flex min-h-screen">
      <Sidebar firstName={profile?.firstName} lastName={profile?.lastName} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-8 pb-16">{children}</div>
      </main>
      <ToastContainer />
    </div>
  );
}
