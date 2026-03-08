import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAdminActivity } from "@/lib/activity-log";
import { ensureDatabaseConfigured, requireSuperAdmin, toAdminRole, type AdminRoleValue } from "@/lib/admin-auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type UtilisateursPageProps = {
  searchParams: Promise<{ status?: string; error?: string }>;
};

const roles = [
  { value: "SUPER_ADMIN", label: "Super admin" },
  { value: "ADMIN", label: "Admin" },
  { value: "EDITOR", label: "Éditeur" },
];

const MIN_PASSWORD_LENGTH = 8;

async function createUserAction(formData: FormData) {
  "use server";

  await requireSuperAdmin();
  ensureDatabaseConfigured();

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();
  const role = toAdminRole(String(formData.get("role") ?? "EDITOR")) as AdminRoleValue;
  const isActive = String(formData.get("isActive") ?? "") === "on";

  if (!fullName || !email || !password) {
    redirect("/admin/utilisateurs?error=missing");
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    redirect("/admin/utilisateurs?error=password-too-short");
  }

  const user = await prisma.adminUser.create({
    data: {
      fullName,
      email,
      passwordHash: hashPassword(password),
      role,
      isActive,
    },
  });

  await logAdminActivity({
    action: "create",
    entityType: "admin_user",
    entityId: user.id,
    details: `Création utilisateur ${user.email}`,
  });

  revalidatePath("/admin/utilisateurs");
  redirect("/admin/utilisateurs?status=created");
}

async function updateUserAction(formData: FormData) {
  "use server";

  await requireSuperAdmin();
  ensureDatabaseConfigured();

  const id = String(formData.get("id") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();
  const role = toAdminRole(String(formData.get("role") ?? "EDITOR")) as AdminRoleValue;
  const isActive = String(formData.get("isActive") ?? "") === "on";

  if (!id || !fullName || !email) {
    redirect("/admin/utilisateurs?error=missing");
  }

  if (password && password.length < MIN_PASSWORD_LENGTH) {
    redirect("/admin/utilisateurs?error=password-too-short");
  }

  await prisma.adminUser.update({
    where: { id },
    data: {
      fullName,
      email,
      role,
      isActive,
      ...(password ? { passwordHash: hashPassword(password) } : {}),
    },
  });

  await logAdminActivity({
    action: "update",
    entityType: "admin_user",
    entityId: id,
    details: `Mise à jour utilisateur ${email}`,
  });

  revalidatePath("/admin/utilisateurs");
  redirect("/admin/utilisateurs?status=updated");
}

async function deleteUserAction(formData: FormData) {
  "use server";

  const session = await requireSuperAdmin();
  ensureDatabaseConfigured();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    redirect("/admin/utilisateurs?error=delete");
  }

  if (session.userId && session.userId === id) {
    redirect("/admin/utilisateurs?error=self-delete");
  }

  const deleted = await prisma.adminUser.delete({ where: { id } });

  await logAdminActivity({
    action: "delete",
    entityType: "admin_user",
    entityId: id,
    details: `Suppression utilisateur ${deleted.email}`,
  });

  revalidatePath("/admin/utilisateurs");
  redirect("/admin/utilisateurs?status=deleted");
}

async function getUsers() {
  if (!process.env.DATABASE_URL) {
    return { rows: [], dbConfigured: false };
  }

  try {
    const rows = await prisma.adminUser.findMany({
      orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    });
    return { rows, dbConfigured: true };
  } catch {
    return { rows: [], dbConfigured: false };
  }
}

const errorMessages: Record<string, string> = {
  missing: "Tous les champs obligatoires doivent être remplis.",
  "password-too-short": `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`,
  delete: "Impossible de supprimer cet utilisateur.",
  "self-delete": "Vous ne pouvez pas supprimer votre propre compte.",
};

export default async function AdminUtilisateursPage({ searchParams }: UtilisateursPageProps) {
  await requireSuperAdmin();
  const params = await searchParams;
  const data = await getUsers();

  return (
    <div className="space-y-6">
      {!data.dbConfigured ? (
        <div className="rounded-lg border border-[rgba(214,101,0,0.3)] bg-[rgba(240,122,20,0.12)] px-4 py-3 text-sm text-[var(--orange-strong)]">
          Base de données non configurée. Ajoutez `DATABASE_URL` pour gérer les utilisateurs.
        </div>
      ) : null}

      {params.status ? (
        <p className="rounded-lg border border-[rgba(19,136,74,0.3)] bg-[rgba(19,136,74,0.12)] px-4 py-3 text-sm text-[var(--green-deep)]">
          Opération réalisée: {params.status}.
        </p>
      ) : null}

      {params.error ? (
        <p className="rounded-lg border border-[rgba(214,101,0,0.3)] bg-[rgba(240,122,20,0.12)] px-4 py-3 text-sm text-[var(--orange-strong)]">
          {errorMessages[params.error] ?? `Erreur de traitement (${params.error}).`}
        </p>
      ) : null}

      <section className="soft-card p-5 sm:p-6">
        <h2 className="text-xl font-extrabold text-[var(--green-deep)]">Créer un utilisateur admin</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">Mot de passe : minimum {MIN_PASSWORD_LENGTH} caractères.</p>
        <form action={createUserAction} className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            name="fullName"
            placeholder="Nom complet"
            required
            className="rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
          />
          <input
            type="password"
            name="password"
            placeholder={`Mot de passe (min. ${MIN_PASSWORD_LENGTH} caractères)`}
            minLength={MIN_PASSWORD_LENGTH}
            required
            className="rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
          />
          <select
            name="role"
            defaultValue="EDITOR"
            className="rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          <label className="md:col-span-2 flex items-center gap-2 text-sm text-[var(--muted)]">
            <input type="checkbox" name="isActive" defaultChecked />
            Compte actif
          </label>
          <button type="submit" className="btn-primary w-fit px-5 py-2 text-sm">
            Créer l&apos;utilisateur
          </button>
        </form>
      </section>

      <section className="space-y-3">
        {data.rows.map((user) => (
          <details key={user.id} className="soft-card p-4 sm:p-5">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[var(--green-deep)]">{user.fullName}</p>
                  <p className="text-xs text-[var(--muted)]">{user.email}</p>
                </div>
                <span className="rounded-lg bg-[rgba(240,122,20,0.12)] px-3 py-1 text-xs font-semibold text-[var(--orange-strong)]">
                  {user.role}
                </span>
              </div>
            </summary>

            <form action={updateUserAction} className="mt-4 grid gap-3 md:grid-cols-2">
              <input type="hidden" name="id" value={user.id} />
              <input
                name="fullName"
                defaultValue={user.fullName}
                required
                className="rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
              />
              <input
                type="email"
                name="email"
                defaultValue={user.email}
                required
                className="rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
              />
              <input
                type="password"
                name="password"
                placeholder={`Nouveau mot de passe (min. ${MIN_PASSWORD_LENGTH} car.)`}
                minLength={MIN_PASSWORD_LENGTH}
                className="rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
              />
              <select
                name="role"
                defaultValue={user.role}
                className="rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none focus:border-[rgba(19,136,74,0.35)]"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <label className="md:col-span-2 flex items-center gap-2 text-sm text-[var(--muted)]">
                <input type="checkbox" name="isActive" defaultChecked={user.isActive} />
                Compte actif
              </label>
              <button type="submit" className="btn-primary w-fit px-5 py-2 text-sm">
                Enregistrer
              </button>
            </form>

            <form action={deleteUserAction} className="mt-2">
              <input type="hidden" name="id" value={user.id} />
              <button
                type="submit"
                className="rounded-lg border border-[rgba(214,101,0,0.35)] bg-[rgba(240,122,20,0.12)] px-4 py-2 text-xs font-semibold text-[var(--orange-strong)] transition hover:bg-[rgba(240,122,20,0.2)]"
              >
                Supprimer l&apos;utilisateur
              </button>
            </form>
          </details>
        ))}
      </section>
    </div>
  );
}
