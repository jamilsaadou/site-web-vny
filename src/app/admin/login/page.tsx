import Link from "next/link";
import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  authenticateAdminCredentials,
  createAdminSession,
  isAdminAuthenticated,
} from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-log";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Connexion admin | Ville de Niamey",
  robots: {
    index: false,
    follow: false,
  },
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

async function loginAction(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const admin = await authenticateAdminCredentials(email, password);

  if (!admin) {
    redirect("/admin/login?error=invalid");
  }

  if (admin.source === "db" && admin.userId && process.env.DATABASE_URL) {
    try {
      await prisma.adminUser.update({
        where: { id: admin.userId },
        data: { lastLoginAt: new Date() },
      });
    } catch {
      // no-op
    }
  }

  await createAdminSession(admin);
  await logAdminActivity({
    action: "login",
    entityType: "auth",
    details: `Connexion admin (${admin.email})`,
  });

  revalidatePath("/admin");
  redirect("/admin");
}

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  const params = await searchParams;
  const error = params.error;

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-14 sm:px-6 lg:px-8">
      <section className="soft-card p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--orange-strong)]">Administration</p>
        <h1 className="display-font mt-2 text-3xl font-extrabold text-[var(--green-deep)] sm:text-4xl">
          Connexion au panel admin
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          Accès réservé à l&apos;équipe de gestion du portail municipal.
        </p>

        {error === "invalid" ? (
          <p className="mt-4 rounded-lg border border-[rgba(214,101,0,0.3)] bg-[rgba(240,122,20,0.13)] px-4 py-3 text-sm text-[var(--orange-strong)]">
            Identifiants invalides.
          </p>
        ) : null}

        <form action={loginAction} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-[var(--green-deep)]">E-mail administrateur</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="username"
              className="mt-2 block w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[rgba(19,136,74,0.38)] focus:ring-2 focus:ring-[rgba(19,136,74,0.12)]"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-[var(--green-deep)]">Mot de passe</span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="mt-2 block w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[rgba(19,136,74,0.38)] focus:ring-2 focus:ring-[rgba(19,136,74,0.12)]"
            />
          </label>

          <button type="submit" className="btn-primary px-6 py-3 text-sm">
            Se connecter
          </button>
        </form>

        <Link href="/" className="mt-6 inline-block text-sm text-[var(--muted)] hover:text-[var(--orange-strong)]">
          Retour au site public
        </Link>
      </section>
    </main>
  );
}
