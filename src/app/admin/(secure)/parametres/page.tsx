import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAdminActivity } from "@/lib/activity-log";
import { ensureDatabaseConfigured, requireAdmin } from "@/lib/admin-auth";
import { AdminImageUploadInput } from "@/components/admin-image-upload-input";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/upload-image";

export const dynamic = "force-dynamic";

type ParametresPageProps = {
  searchParams: Promise<{ status?: string; error?: string }>;
};

async function saveSettingsAction(formData: FormData) {
  "use server";

  await requireAdmin();
  ensureDatabaseConfigured();

  const siteName = String(formData.get("siteName") ?? "").trim();
  const footerText = String(formData.get("footerText") ?? "").trim();
  const googleAnalyticsId = String(formData.get("googleAnalyticsId") ?? "").trim();

  const smtpHost = String(formData.get("smtpHost") ?? "").trim();
  const smtpPortRaw = String(formData.get("smtpPort") ?? "").trim();
  const smtpPort = smtpPortRaw ? Number(smtpPortRaw) : null;
  const smtpUser = String(formData.get("smtpUser") ?? "").trim();
  const smtpPassword = String(formData.get("smtpPassword") ?? "").trim();
  const smtpFromEmail = String(formData.get("smtpFromEmail") ?? "").trim();
  const smtpFromName = String(formData.get("smtpFromName") ?? "").trim();

  // Handle logo upload
  const logoFile = formData.get("logoFile");
  let siteLogoPath: string | undefined;
  if (logoFile instanceof File && logoFile.size > 0) {
    try {
      siteLogoPath = (await saveUploadedImage(logoFile, "site-logo")) ?? undefined;
    } catch {
      redirect("/admin/parametres?error=logo");
    }
  }

  // Handle favicon upload
  const faviconFile = formData.get("faviconFile");
  let faviconPath: string | undefined;
  if (faviconFile instanceof File && faviconFile.size > 0) {
    try {
      faviconPath = (await saveUploadedImage(faviconFile, "site-favicon")) ?? undefined;
    } catch {
      redirect("/admin/parametres?error=favicon");
    }
  }

  try {
    await prisma.siteSettings.upsert({
      where: { id: "main" },
      update: {
        siteName: siteName || "Ville de Niamey",
        footerText: footerText || null,
        googleAnalyticsId: googleAnalyticsId || null,
        smtpHost: smtpHost || null,
        smtpPort: smtpPort && Number.isFinite(smtpPort) ? smtpPort : null,
        smtpUser: smtpUser || null,
        smtpPassword: smtpPassword || null,
        smtpFromEmail: smtpFromEmail || null,
        smtpFromName: smtpFromName || null,
        ...(siteLogoPath !== undefined ? { siteLogoPath } : {}),
        ...(faviconPath !== undefined ? { faviconPath } : {}),
      },
      create: {
        id: "main",
        siteName: siteName || "Ville de Niamey",
        footerText: footerText || null,
        googleAnalyticsId: googleAnalyticsId || null,
        smtpHost: smtpHost || null,
        smtpPort: smtpPort && Number.isFinite(smtpPort) ? smtpPort : null,
        smtpUser: smtpUser || null,
        smtpPassword: smtpPassword || null,
        smtpFromEmail: smtpFromEmail || null,
        smtpFromName: smtpFromName || null,
        siteLogoPath: siteLogoPath ?? null,
        faviconPath: faviconPath ?? null,
      },
    });

    await logAdminActivity({
      action: "update",
      entityType: "site_settings",
      entityId: "main",
      details: "Mise à jour des paramètres du site",
    });
  } catch {
    redirect("/admin/parametres?error=save");
  }

  revalidatePath("/");
  revalidatePath("/admin/parametres");
  redirect("/admin/parametres?status=saved");
}

async function getSettings() {
  if (!process.env.DATABASE_URL) {
    return { settings: null, dbConfigured: false };
  }
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
    return { settings, dbConfigured: true };
  } catch {
    return { settings: null, dbConfigured: false };
  }
}

const inputClass =
  "w-full rounded-lg border border-[#d8dde3] bg-white px-4 py-2.5 text-sm outline-none focus:border-[rgba(19,136,74,0.45)] focus:ring-1 focus:ring-[rgba(19,136,74,0.15)]";
const labelClass = "block text-xs font-semibold text-[#475467] mb-1";

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="soft-card overflow-hidden">
      <div className="border-b border-[#eaecf0] bg-[#f8fafc] px-6 py-4">
        <h2 className="text-base font-bold text-[#111827]">{title}</h2>
        {description ? <p className="mt-0.5 text-xs text-[#667085]">{description}</p> : null}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

export default async function AdminParametresPage({ searchParams }: ParametresPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const { settings, dbConfigured } = await getSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Paramètres du site</h1>
        <p className="mt-1 text-sm text-[#667085]">
          Configurez les éléments globaux du site: identité, logo, favicon et SMTP.
        </p>
      </div>

      {!dbConfigured ? (
        <div className="rounded-lg border border-[rgba(214,101,0,0.3)] bg-[rgba(240,122,20,0.12)] px-4 py-3 text-sm text-[var(--orange-strong)]">
          Base de données non configurée. Ajoutez <code className="font-mono">DATABASE_URL</code> pour accéder aux paramètres.
        </div>
      ) : null}

      {params.status === "saved" ? (
        <p className="rounded-lg border border-[rgba(19,136,74,0.3)] bg-[rgba(19,136,74,0.12)] px-4 py-3 text-sm text-[var(--green-deep)]">
          Paramètres enregistrés avec succès.
        </p>
      ) : null}

      {params.error ? (
        <p className="rounded-lg border border-[rgba(214,101,0,0.3)] bg-[rgba(240,122,20,0.12)] px-4 py-3 text-sm text-[var(--orange-strong)]">
          {params.error === "logo"
            ? "Erreur lors de l'import du logo."
            : params.error === "favicon"
              ? "Erreur lors de l'import du favicon."
              : `Erreur lors de la sauvegarde (${params.error}).`}
        </p>
      ) : null}

      {!dbConfigured ? null : (
        <form action={saveSettingsAction} className="space-y-6">

          {/* ── Identité du site ── */}
          <SectionCard title="Identité du site" description="Nom et texte de bas de page affichés sur l'ensemble du site.">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={labelClass}>Nom du site</label>
                <input
                  name="siteName"
                  defaultValue={settings?.siteName ?? "Ville de Niamey"}
                  className={inputClass}
                  placeholder="Ville de Niamey"
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Texte de pied de page (footer)</label>
                <textarea
                  name="footerText"
                  defaultValue={settings?.footerText ?? ""}
                  rows={3}
                  className={inputClass}
                  placeholder="© 2026 Ville de Niamey. Tous droits réservés."
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>ID Google Analytics (optionnel)</label>
                <input
                  name="googleAnalyticsId"
                  defaultValue={settings?.googleAnalyticsId ?? ""}
                  className={inputClass}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
            </div>
          </SectionCard>

          {/* ── Logo & Favicon ── */}
          <SectionCard
            title="Logo & Favicon"
            description="Le logo apparaît dans l'en-tête du site. Le favicon est l'icône affichée dans l'onglet du navigateur."
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                {settings?.siteLogoPath ? (
                  <div className="mb-3 flex items-center gap-3 rounded-lg border border-[#d8dde3] bg-[#f8fafc] p-3">
                    <img src={settings.siteLogoPath} alt="Logo actuel" className="h-10 max-w-[120px] rounded object-contain" />
                    <p className="text-xs text-[#667085]">Logo actuel</p>
                  </div>
                ) : null}
                <AdminImageUploadInput
                  name="logoFile"
                  label={settings?.siteLogoPath ? "Remplacer le logo" : "Importer le logo du site"}
                />
                <p className="mt-1 text-[11px] text-[#98a2b3]">PNG ou SVG recommandé, fond transparent de préférence.</p>
              </div>
              <div>
                {settings?.faviconPath ? (
                  <div className="mb-3 flex items-center gap-3 rounded-lg border border-[#d8dde3] bg-[#f8fafc] p-3">
                    <img src={settings.faviconPath} alt="Favicon actuel" className="h-8 w-8 rounded object-contain" />
                    <p className="text-xs text-[#667085]">Favicon actuel</p>
                  </div>
                ) : null}
                <AdminImageUploadInput
                  name="faviconFile"
                  label={settings?.faviconPath ? "Remplacer le favicon" : "Importer le favicon"}
                />
                <p className="mt-1 text-[11px] text-[#98a2b3]">PNG carré 32×32 px ou 64×64 px recommandé.</p>
              </div>
            </div>
          </SectionCard>

          {/* ── SMTP ── */}
          <SectionCard
            title="Configuration e-mail (SMTP)"
            description="Permet l'envoi d'e-mails depuis le site (notifications, formulaire de contact). Ces paramètres ne sont pas utilisés si le champ Hôte est vide."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Hôte SMTP</label>
                <input
                  name="smtpHost"
                  defaultValue={settings?.smtpHost ?? ""}
                  className={inputClass}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <label className={labelClass}>Port SMTP</label>
                <input
                  type="number"
                  name="smtpPort"
                  defaultValue={settings?.smtpPort ?? ""}
                  className={inputClass}
                  placeholder="587"
                />
              </div>
              <div>
                <label className={labelClass}>Utilisateur SMTP</label>
                <input
                  name="smtpUser"
                  defaultValue={settings?.smtpUser ?? ""}
                  className={inputClass}
                  placeholder="contact@niamey.ne"
                  autoComplete="off"
                />
              </div>
              <div>
                <label className={labelClass}>Mot de passe SMTP</label>
                <input
                  type="password"
                  name="smtpPassword"
                  defaultValue={settings?.smtpPassword ?? ""}
                  className={inputClass}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className={labelClass}>E-mail expéditeur</label>
                <input
                  type="email"
                  name="smtpFromEmail"
                  defaultValue={settings?.smtpFromEmail ?? ""}
                  className={inputClass}
                  placeholder="noreply@niamey.ne"
                />
              </div>
              <div>
                <label className={labelClass}>Nom expéditeur</label>
                <input
                  name="smtpFromName"
                  defaultValue={settings?.smtpFromName ?? ""}
                  className={inputClass}
                  placeholder="Ville de Niamey"
                />
              </div>
              <div className="md:col-span-2">
                <div className="rounded-lg border border-[rgba(19,136,74,0.2)] bg-[rgba(19,136,74,0.05)] px-4 py-3 text-xs text-[#475467]">
                  <span className="font-semibold text-[var(--green-deep)]">Conseil :</span> Pour Gmail, activez les «&nbsp;Mots de passe d'application&nbsp;» et utilisez le mot de passe généré ici, avec le port 587 et TLS.
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Submit */}
          <div className="flex justify-end">
            <button type="submit" className="btn-primary px-6 py-2.5 text-sm font-semibold">
              Enregistrer les paramètres
            </button>
          </div>

        </form>
      )}
    </div>
  );
}
