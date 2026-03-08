import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureDatabaseConfigured, requireAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/activity-log";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type MessagesPageProps = {
  searchParams: Promise<{ status?: string; error?: string }>;
};

async function deleteMessageAction(formData: FormData) {
  "use server";

  await requireAdmin();
  ensureDatabaseConfigured();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    redirect("/admin/messages?error=delete");
  }

  try {
    await prisma.contactMessage.delete({ where: { id } });
  } catch {
    redirect("/admin/messages?error=delete");
  }

  await logAdminActivity({
    action: "delete",
    entityType: "contact_message",
    entityId: id,
    details: "Suppression message citoyen",
  });

  revalidatePath("/admin");
  revalidatePath("/admin/messages");
  redirect("/admin/messages?status=deleted");
}

async function getMessages() {
  if (!process.env.DATABASE_URL) {
    return { rows: [], dbConfigured: false };
  }

  try {
    const rows = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { rows, dbConfigured: true };
  } catch {
    return { rows: [], dbConfigured: false };
  }
}

export default async function AdminMessagesPage({ searchParams }: MessagesPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const { rows, dbConfigured } = await getMessages();

  return (
    <div className="space-y-6">
      {!dbConfigured ? (
        <div className="rounded-lg border border-[rgba(214,101,0,0.3)] bg-[rgba(240,122,20,0.12)] px-4 py-3 text-sm text-[var(--orange-strong)]">
          Base de données non configurée. Ajoutez `DATABASE_URL` pour consulter les messages.
        </div>
      ) : null}

      {params.status ? (
        <p className="rounded-lg border border-[rgba(19,136,74,0.3)] bg-[rgba(19,136,74,0.12)] px-4 py-3 text-sm text-[var(--green-deep)]">
          Opération réalisée: {params.status}.
        </p>
      ) : null}

      {params.error ? (
        <p className="rounded-lg border border-[rgba(214,101,0,0.3)] bg-[rgba(240,122,20,0.12)] px-4 py-3 text-sm text-[var(--orange-strong)]">
          Impossible de traiter la demande ({params.error}).
        </p>
      ) : null}

      <section className="soft-card p-5 sm:p-6">
        <h2 className="text-xl font-extrabold text-[var(--green-deep)]">Messages citoyens</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">{rows.length} message(s) reçu(s).</p>
      </section>

      <section className="space-y-3">
        {rows.map((message) => (
          <details key={message.id} className="soft-card p-4 sm:p-5">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[var(--green-deep)]">{message.subject}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {message.fullName} - {message.email}
                  </p>
                </div>
                <span className="text-xs text-[var(--muted)]">
                  {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(message.createdAt)}
                </span>
              </div>
            </summary>

            <p className="mt-4 rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-sm leading-7 text-[var(--text)]">
              {message.message}
            </p>

            <form action={deleteMessageAction} className="mt-3">
              <input type="hidden" name="id" value={message.id} />
              <button
                type="submit"
                className="rounded-lg border border-[rgba(214,101,0,0.35)] bg-[rgba(240,122,20,0.12)] px-4 py-2 text-xs font-semibold text-[var(--orange-strong)] transition hover:bg-[rgba(240,122,20,0.2)]"
              >
                Supprimer ce message
              </button>
            </form>
          </details>
        ))}
      </section>
    </div>
  );
}
