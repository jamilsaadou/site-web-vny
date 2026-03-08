import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { clearAdminSession, requireAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-log";
import { AdminSidebarNav } from "@/components/admin-sidebar-nav";

export const metadata: Metadata = {
  title: "Administration | Ville de Niamey",
  robots: {
    index: false,
    follow: false,
  },
};

async function logoutAction() {
  "use server";
  await logAdminActivity({
    action: "logout",
    entityType: "auth",
    details: "Déconnexion admin",
  });
  await clearAdminSession();
  redirect("/admin/login");
}

export default async function AdminSecureLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAdmin();

  return (
    <div className="wp-admin-shell min-h-screen">
      {/* ── Top bar ── */}
      <header className="wp-admin-topbar">
        <Link
          href="/admin"
          className="flex items-center gap-2.5 px-4 py-2 hover:opacity-80 transition-opacity"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(19,136,74,0.35)] ring-1 ring-[rgba(19,136,74,0.5)]">
            <svg viewBox="0 0 20 20" className="h-4 w-4 text-[#7de0a8]" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 3h6v6H3zM11 3h6v3h-6zM11 8h6v9h-6zM3 11h6v6H3z" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#7de0a8]">Administration</p>
            <p className="text-[10px] leading-none text-[rgba(255,255,255,0.35)]">Ville de Niamey</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="hidden items-center gap-1.5 rounded-lg border border-[rgba(255,255,255,0.1)] px-3 py-1.5 text-xs text-[#9ab5a4] transition hover:border-[rgba(255,255,255,0.2)] hover:text-white sm:flex"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="8" cy="8" r="7" />
              <path d="M1 8h14M8 1c-2 2-3 4.5-3 7s1 5 3 7M8 1c2 2 3 4.5 3 7s-1 5-3 7" />
            </svg>
            Voir le site
          </Link>
          <div className="flex items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-3 py-1.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgba(19,136,74,0.4)] text-[10px] font-bold text-[#7de0a8]">
              {session.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-[11px] font-semibold text-[#d4e8dc]">{session.fullName}</p>
              <p className="text-[10px] leading-none text-[rgba(255,255,255,0.35)]">{session.role}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-48px)]">
        {/* ── Sidebar ── */}
        <aside className="wp-admin-sidebar hidden md:flex md:w-[220px] md:flex-col md:justify-between">
          <div className="px-2.5 py-2">
            <AdminSidebarNav />
          </div>

          <div className="border-t border-[rgba(255,255,255,0.07)] px-3 py-3">
            <p className="truncate px-2 text-xs text-[#7da192]">{session.email}</p>
            <form action={logoutAction} className="mt-2">
              <button type="submit" className="wp-admin-logout">
                Déconnexion
              </button>
            </form>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="wp-admin-content min-w-0 flex-1">
          <main className="p-5 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
