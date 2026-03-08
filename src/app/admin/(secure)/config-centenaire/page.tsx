import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAdminActivity } from "@/lib/activity-log";
import { ensureDatabaseConfigured, requireAdmin } from "@/lib/admin-auth";
import { AdminImageUploadInput } from "@/components/admin-image-upload-input";
import { AdminMediaPicker } from "@/components/admin-media-picker";
import { AdminListEditor } from "@/components/admin-list-editor";
import { CENTENARY_ALLOWED_ICONS, mergeCentenaireConfig } from "@/lib/centenaire-config";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/upload-image";

export const dynamic = "force-dynamic";

type AdminConfigCentenairePageProps = {
  searchParams: Promise<{ status?: string; error?: string }>;
};

async function updateCentenaireConfigAction(formData: FormData) {
  "use server";

  await requireAdmin();
  try {
    ensureDatabaseConfigured();
  } catch {
    redirect("/admin/config-centenaire?error=db");
  }

  const heroBadge = String(formData.get("heroBadge") ?? "").trim();
  const heroTitle = String(formData.get("heroTitle") ?? "").trim();
  const heroIntro = String(formData.get("heroIntro") ?? "").trim();
  const heroImageFromPicker = String(formData.get("heroImagePath") ?? "").trim();
  const heroImageFile = formData.get("heroImageFile");
  const heroImageEyebrow = String(formData.get("heroImageEyebrow") ?? "").trim();
  const heroImageCaption = String(formData.get("heroImageCaption") ?? "").trim();
  const keyFactsLines = String(formData.get("keyFactsLines") ?? "").trim();

  const milestonesEyebrow = String(formData.get("milestonesEyebrow") ?? "").trim();
  const milestonesTitle = String(formData.get("milestonesTitle") ?? "").trim();
  const milestonesLines = String(formData.get("milestonesLines") ?? "").trim();

  const themeEyebrow = String(formData.get("themeEyebrow") ?? "").trim();
  const themeTitle = String(formData.get("themeTitle") ?? "").trim();
  const themeDescription = String(formData.get("themeDescription") ?? "").trim();

  const objectivesEyebrow = String(formData.get("objectivesEyebrow") ?? "").trim();
  const objectivesTitle = String(formData.get("objectivesTitle") ?? "").trim();
  const objectivesLines = String(formData.get("objectivesLines") ?? "").trim();

  const axesEyebrow = String(formData.get("axesEyebrow") ?? "").trim();
  const axesTitle = String(formData.get("axesTitle") ?? "").trim();
  const strategicAxesLines = String(formData.get("strategicAxesLines") ?? "").trim();

  const agendaEyebrow = String(formData.get("agendaEyebrow") ?? "").trim();
  const agendaTitle = String(formData.get("agendaTitle") ?? "").trim();
  const agendaSubtitle = String(formData.get("agendaSubtitle") ?? "").trim();
  const annualAgendaLines = String(formData.get("annualAgendaLines") ?? "").trim();

  const galleryEyebrow = String(formData.get("galleryEyebrow") ?? "").trim();
  const galleryTitle = String(formData.get("galleryTitle") ?? "").trim();
  const galleryLines = String(formData.get("galleryLines") ?? "").trim();

  const heroPrimaryCtaLabel = String(formData.get("heroPrimaryCtaLabel") ?? "").trim();
  const heroPrimaryCtaHref = String(formData.get("heroPrimaryCtaHref") ?? "").trim();
  const heroSecondaryCtaLabel = String(formData.get("heroSecondaryCtaLabel") ?? "").trim();
  const heroSecondaryCtaHref = String(formData.get("heroSecondaryCtaHref") ?? "").trim();
  const galleryPrimaryCtaLabel = String(formData.get("galleryPrimaryCtaLabel") ?? "").trim();
  const galleryPrimaryCtaHref = String(formData.get("galleryPrimaryCtaHref") ?? "").trim();
  const gallerySecondaryCtaLabel = String(formData.get("gallerySecondaryCtaLabel") ?? "").trim();
  const gallerySecondaryCtaHref = String(formData.get("gallerySecondaryCtaHref") ?? "").trim();

  const seoTitle = String(formData.get("seoTitle") ?? "").trim();
  const seoDescription = String(formData.get("seoDescription") ?? "").trim();
  const seoKeywords = String(formData.get("seoKeywords") ?? "").trim();

  let heroImagePath = heroImageFromPicker;
  if (heroImageFile instanceof File && heroImageFile.size > 0) {
    try {
      heroImagePath = (await saveUploadedImage(heroImageFile, "centenaire-hero")) ?? heroImageFromPicker;
    } catch {
      redirect("/admin/config-centenaire?error=hero-image");
    }
  }

  if (!heroImagePath) {
    redirect("/admin/config-centenaire?error=hero-image");
  }

  const requiredFields = [
    heroBadge, heroTitle, heroIntro, heroImageEyebrow, heroImageCaption,
    keyFactsLines, milestonesEyebrow, milestonesTitle, milestonesLines,
    themeEyebrow, themeTitle, themeDescription,
    objectivesEyebrow, objectivesTitle, objectivesLines,
    axesEyebrow, axesTitle, strategicAxesLines,
    agendaEyebrow, agendaTitle, agendaSubtitle, annualAgendaLines,
    galleryEyebrow, galleryTitle, galleryLines,
    heroPrimaryCtaLabel, heroPrimaryCtaHref,
    heroSecondaryCtaLabel, heroSecondaryCtaHref,
    galleryPrimaryCtaLabel, galleryPrimaryCtaHref,
    gallerySecondaryCtaLabel, gallerySecondaryCtaHref,
  ];

  if (requiredFields.some((value) => !value)) {
    redirect("/admin/config-centenaire?error=missing");
  }

  try {
    await prisma.centenaireConfig.upsert({
      where: { id: "main" },
      update: {
        heroBadge, heroTitle, heroIntro, heroImagePath, heroImageEyebrow, heroImageCaption,
        keyFactsLines, milestonesEyebrow, milestonesTitle, milestonesLines,
        themeEyebrow, themeTitle, themeDescription,
        objectivesEyebrow, objectivesTitle, objectivesLines,
        axesEyebrow, axesTitle, strategicAxesLines,
        agendaEyebrow, agendaTitle, agendaSubtitle, annualAgendaLines,
        galleryEyebrow, galleryTitle, galleryLines,
        heroPrimaryCtaLabel, heroPrimaryCtaHref,
        heroSecondaryCtaLabel, heroSecondaryCtaHref,
        galleryPrimaryCtaLabel, galleryPrimaryCtaHref,
        gallerySecondaryCtaLabel, gallerySecondaryCtaHref,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        seoKeywords: seoKeywords || null,
      },
      create: {
        id: "main",
        heroBadge, heroTitle, heroIntro, heroImagePath, heroImageEyebrow, heroImageCaption,
        keyFactsLines, milestonesEyebrow, milestonesTitle, milestonesLines,
        themeEyebrow, themeTitle, themeDescription,
        objectivesEyebrow, objectivesTitle, objectivesLines,
        axesEyebrow, axesTitle, strategicAxesLines,
        agendaEyebrow, agendaTitle, agendaSubtitle, annualAgendaLines,
        galleryEyebrow, galleryTitle, galleryLines,
        heroPrimaryCtaLabel, heroPrimaryCtaHref,
        heroSecondaryCtaLabel, heroSecondaryCtaHref,
        galleryPrimaryCtaLabel, galleryPrimaryCtaHref,
        gallerySecondaryCtaLabel, gallerySecondaryCtaHref,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        seoKeywords: seoKeywords || null,
      },
    });

    await logAdminActivity({
      action: "update",
      entityType: "centenaire_config",
      entityId: "main",
      details: "Mise à jour complète de la page centenaire",
    });
  } catch {
    redirect("/admin/config-centenaire?error=save");
  }

  revalidatePath("/centenaire");
  revalidatePath("/admin/config-centenaire");
  redirect("/admin/config-centenaire?status=updated");
}

async function getConfigData() {
  if (!process.env.DATABASE_URL) {
    return { dbConfigured: false, config: null, mediaRows: [] };
  }
  try {
    const [config, mediaRows] = await Promise.all([
      prisma.centenaireConfig.findUnique({ where: { id: "main" } }),
      prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 120 }),
    ]);
    return { dbConfigured: true, config, mediaRows };
  } catch {
    return { dbConfigured: false, config: null, mediaRows: [] };
  }
}

const inputClass =
  "w-full rounded-lg border border-[#d8dde3] bg-white px-4 py-2.5 text-sm outline-none focus:border-[rgba(19,136,74,0.45)] focus:ring-1 focus:ring-[rgba(19,136,74,0.15)]";
const labelClass = "block text-xs font-semibold text-[#475467] mb-1";

const iconOptions = CENTENARY_ALLOWED_ICONS.map((icon) => ({ value: icon, label: icon }));

export default async function AdminConfigCentenairePage({ searchParams }: AdminConfigCentenairePageProps) {
  await requireAdmin();
  const params = await searchParams;
  const data = await getConfigData();
  const values = mergeCentenaireConfig(data.config);

  return (
    <div className="space-y-6">
      {!data.dbConfigured ? (
        <div className="rounded-lg border border-[rgba(214,101,0,0.3)] bg-[rgba(240,122,20,0.12)] px-4 py-3 text-sm text-[var(--orange-strong)]">
          Base de données non configurée. Ajoutez <code className="font-mono">DATABASE_URL</code> pour gérer la page centenaire.
        </div>
      ) : null}

      {params.status === "updated" ? (
        <p className="rounded-lg border border-[rgba(19,136,74,0.3)] bg-[rgba(19,136,74,0.12)] px-4 py-3 text-sm text-[var(--green-deep)]">
          Page centenaire mise à jour avec succès.
        </p>
      ) : null}

      {params.error ? (
        <p className="rounded-lg border border-[rgba(214,101,0,0.3)] bg-[rgba(240,122,20,0.12)] px-4 py-3 text-sm text-[var(--orange-strong)]">
          {params.error === "missing"
            ? "Certains champs obligatoires sont vides. Vérifiez chaque section."
            : params.error === "hero-image"
              ? "Aucune image hero sélectionnée."
              : `Erreur lors de la sauvegarde (${params.error}).`}
        </p>
      ) : null}

      {!data.dbConfigured ? null : (
        <form action={updateCentenaireConfigAction} className="space-y-6">

          {/* Hero */}
          <section className="soft-card overflow-hidden">
            <div className="border-b border-[#eaecf0] bg-[#f8fafc] px-6 py-4">
              <h2 className="text-base font-bold text-[#111827]">Section principale (Hero)</h2>
              <p className="mt-0.5 text-xs text-[#667085]">L'image et le texte d'accroche qui apparaissent en haut de la page.</p>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-2">
              <div>
                <label className={labelClass}>Badge (petit texte au-dessus du titre)</label>
                <input name="heroBadge" defaultValue={values.heroBadge} required className={inputClass} placeholder="Ex: Le centenaire" />
              </div>
              <div>
                <label className={labelClass}>Texte légende image</label>
                <input name="heroImageEyebrow" defaultValue={values.heroImageEyebrow} required className={inputClass} placeholder="Ex: Niamey vue du ciel" />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Titre principal</label>
                <textarea name="heroTitle" defaultValue={values.heroTitle} required rows={2} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Texte d'introduction</label>
                <textarea name="heroIntro" defaultValue={values.heroIntro} required rows={3} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Légende sous l'image</label>
                <textarea name="heroImageCaption" defaultValue={values.heroImageCaption} required rows={2} className={inputClass} />
              </div>
              <div className="md:col-span-2 grid gap-4 xl:grid-cols-2">
                <AdminMediaPicker name="heroImagePath" items={data.mediaRows} defaultValue={values.heroImagePath} label="Image hero (médiathèque)" />
                <AdminImageUploadInput name="heroImageFile" defaultPreview={values.heroImagePath} label="Ou importer une nouvelle image hero" />
              </div>
            </div>
          </section>

          {/* Repères clés */}
          <section className="soft-card overflow-hidden">
            <div className="border-b border-[#eaecf0] bg-[#f8fafc] px-6 py-4">
              <h2 className="text-base font-bold text-[#111827]">Chiffres / Repères clés</h2>
              <p className="mt-0.5 text-xs text-[#667085]">Les faits affichés sous forme de statistiques (dates, durées, chiffres…).</p>
            </div>
            <div className="p-6">
              <AdminListEditor
                name="keyFactsLines"
                defaultValue={values.keyFactsLines}
                addLabel="Ajouter un repère"
                rowLabel="repère"
                columns={[
                  { label: "Libellé", placeholder: "Ex: Décret fondateur", flex: 1 },
                  { label: "Valeur", placeholder: "Ex: 26 décembre 1926", flex: 1 },
                ]}
              />
            </div>
          </section>

          {/* Chronologie */}
          <section className="soft-card overflow-hidden">
            <div className="border-b border-[#eaecf0] bg-[#f8fafc] px-6 py-4">
              <h2 className="text-base font-bold text-[#111827]">Chronologie historique</h2>
              <p className="mt-0.5 text-xs text-[#667085]">Les grandes étapes de l'histoire de Niamey, affichées en frise.</p>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-2">
              <div>
                <label className={labelClass}>Sous-titre de section</label>
                <input name="milestonesEyebrow" defaultValue={values.milestonesEyebrow} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Titre de section</label>
                <input name="milestonesTitle" defaultValue={values.milestonesTitle} required className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <AdminListEditor
                  name="milestonesLines"
                  defaultValue={values.milestonesLines}
                  addLabel="Ajouter une étape"
                  rowLabel="étape"
                  columns={[
                    { label: "Année", placeholder: "1926", flex: 0.5 },
                    { label: "Titre", placeholder: "Élévation de Niamey", flex: 1 },
                    { label: "Description", placeholder: "Le décret marque...", flex: 1.5, type: "textarea" },
                  ]}
                />
              </div>
            </div>
          </section>

          {/* Thème */}
          <section className="soft-card overflow-hidden">
            <div className="border-b border-[#eaecf0] bg-[#f8fafc] px-6 py-4">
              <h2 className="text-base font-bold text-[#111827]">Thème général du centenaire</h2>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-2">
              <div>
                <label className={labelClass}>Sous-titre</label>
                <input name="themeEyebrow" defaultValue={values.themeEyebrow} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Titre</label>
                <input name="themeTitle" defaultValue={values.themeTitle} required className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea name="themeDescription" defaultValue={values.themeDescription} required rows={4} className={inputClass} />
              </div>
            </div>
          </section>

          {/* Objectifs */}
          <section className="soft-card overflow-hidden">
            <div className="border-b border-[#eaecf0] bg-[#f8fafc] px-6 py-4">
              <h2 className="text-base font-bold text-[#111827]">Objectifs du programme</h2>
              <p className="mt-0.5 text-xs text-[#667085]">
                Icônes disponibles: {CENTENARY_ALLOWED_ICONS.join(", ")}.
              </p>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-2">
              <div>
                <label className={labelClass}>Sous-titre</label>
                <input name="objectivesEyebrow" defaultValue={values.objectivesEyebrow} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Titre</label>
                <input name="objectivesTitle" defaultValue={values.objectivesTitle} required className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <AdminListEditor
                  name="objectivesLines"
                  defaultValue={values.objectivesLines}
                  addLabel="Ajouter un objectif"
                  rowLabel="objectif"
                  columns={[
                    { label: "Icône", type: "select", options: iconOptions, flex: 0.6 },
                    { label: "Titre", placeholder: "Valoriser le patrimoine", flex: 1 },
                    { label: "Détail", placeholder: "Mettre en lumière...", flex: 1.5, type: "textarea" },
                  ]}
                />
              </div>
            </div>
          </section>

          {/* Axes stratégiques */}
          <section className="soft-card overflow-hidden">
            <div className="border-b border-[#eaecf0] bg-[#f8fafc] px-6 py-4">
              <h2 className="text-base font-bold text-[#111827]">Axes stratégiques</h2>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-2">
              <div>
                <label className={labelClass}>Sous-titre</label>
                <input name="axesEyebrow" defaultValue={values.axesEyebrow} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Titre</label>
                <input name="axesTitle" defaultValue={values.axesTitle} required className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <AdminListEditor
                  name="strategicAxesLines"
                  defaultValue={values.strategicAxesLines}
                  addLabel="Ajouter un axe"
                  rowLabel="axe"
                  columns={[
                    { label: "Icône", type: "select", options: iconOptions, flex: 0.6 },
                    { label: "Titre", placeholder: "Mémoire & patrimoine", flex: 1 },
                    { label: "Détail", placeholder: "Sauvegarde...", flex: 1.5, type: "textarea" },
                  ]}
                />
              </div>
            </div>
          </section>

          {/* Agenda */}
          <section className="soft-card overflow-hidden">
            <div className="border-b border-[#eaecf0] bg-[#f8fafc] px-6 py-4">
              <h2 className="text-base font-bold text-[#111827]">Calendrier mensuel 2026</h2>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-2">
              <div>
                <label className={labelClass}>Sous-titre</label>
                <input name="agendaEyebrow" defaultValue={values.agendaEyebrow} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Titre</label>
                <input name="agendaTitle" defaultValue={values.agendaTitle} required className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Introduction</label>
                <textarea name="agendaSubtitle" defaultValue={values.agendaSubtitle} required rows={2} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <AdminListEditor
                  name="annualAgendaLines"
                  defaultValue={values.annualAgendaLines}
                  addLabel="Ajouter un mois"
                  rowLabel="mois"
                  columns={[
                    { label: "Mois", placeholder: "Janvier", flex: 0.6 },
                    { label: "Thème", placeholder: "Lancement officiel", flex: 1 },
                    { label: "Points clés", placeholder: "Cérémonie solennelle...", flex: 1.5, type: "textarea" },
                  ]}
                />
              </div>
            </div>
          </section>

          {/* Galerie */}
          <section className="soft-card overflow-hidden">
            <div className="border-b border-[#eaecf0] bg-[#f8fafc] px-6 py-4">
              <h2 className="text-base font-bold text-[#111827]">Galerie photos</h2>
              <p className="mt-0.5 text-xs text-[#667085]">
                Le chemin image doit pointer vers un fichier existant dans la médiathèque (ex: /media/photo.jpg).
              </p>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-2">
              <div>
                <label className={labelClass}>Sous-titre</label>
                <input name="galleryEyebrow" defaultValue={values.galleryEyebrow} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Titre</label>
                <input name="galleryTitle" defaultValue={values.galleryTitle} required className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <AdminListEditor
                  name="galleryLines"
                  defaultValue={values.galleryLines}
                  addLabel="Ajouter une image"
                  rowLabel="image"
                  columns={[
                    { label: "Chemin (/media/…)", placeholder: "/media/photo.jpg", flex: 1 },
                    { label: "Titre", placeholder: "Ouverture officielle", flex: 0.8 },
                    { label: "Description", placeholder: "Démarrage du programme...", flex: 1.2 },
                  ]}
                />
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="soft-card overflow-hidden">
            <div className="border-b border-[#eaecf0] bg-[#f8fafc] px-6 py-4">
              <h2 className="text-base font-bold text-[#111827]">Boutons d'action (CTA)</h2>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-2">
              <div>
                <label className={labelClass}>Hero — Bouton principal (texte)</label>
                <input name="heroPrimaryCtaLabel" defaultValue={values.heroPrimaryCtaLabel} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Hero — Bouton principal (lien)</label>
                <input name="heroPrimaryCtaHref" defaultValue={values.heroPrimaryCtaHref} required className={inputClass} placeholder="/actualite" />
              </div>
              <div>
                <label className={labelClass}>Hero — Bouton secondaire (texte)</label>
                <input name="heroSecondaryCtaLabel" defaultValue={values.heroSecondaryCtaLabel} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Hero — Bouton secondaire (lien)</label>
                <input name="heroSecondaryCtaHref" defaultValue={values.heroSecondaryCtaHref} required className={inputClass} placeholder="/contact" />
              </div>
              <div>
                <label className={labelClass}>Galerie — Bouton principal (texte)</label>
                <input name="galleryPrimaryCtaLabel" defaultValue={values.galleryPrimaryCtaLabel} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Galerie — Bouton principal (lien)</label>
                <input name="galleryPrimaryCtaHref" defaultValue={values.galleryPrimaryCtaHref} required className={inputClass} placeholder="/actualite" />
              </div>
              <div>
                <label className={labelClass}>Galerie — Bouton secondaire (texte)</label>
                <input name="gallerySecondaryCtaLabel" defaultValue={values.gallerySecondaryCtaLabel} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Galerie — Bouton secondaire (lien)</label>
                <input name="gallerySecondaryCtaHref" defaultValue={values.gallerySecondaryCtaHref} required className={inputClass} placeholder="/contact" />
              </div>
            </div>
          </section>

          {/* SEO */}
          <section className="soft-card overflow-hidden">
            <div className="border-b border-[#eaecf0] bg-[#f8fafc] px-6 py-4">
              <h2 className="text-base font-bold text-[#111827]">SEO (référencement)</h2>
              <p className="mt-0.5 text-xs text-[#667085]">Optionnel — personnalise l'apparence dans Google.</p>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-2">
              <div>
                <label className={labelClass}>Titre SEO</label>
                <input name="seoTitle" defaultValue={values.seoTitle ?? ""} className={inputClass} placeholder="Titre affiché dans Google..." />
              </div>
              <div>
                <label className={labelClass}>Mots-clés</label>
                <input name="seoKeywords" defaultValue={values.seoKeywords ?? ""} className={inputClass} placeholder="centenaire, niamey, 2026..." />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Description SEO</label>
                <textarea name="seoDescription" defaultValue={values.seoDescription ?? ""} rows={3} className={inputClass} placeholder="Description affichée dans les résultats..." />
              </div>
            </div>
            <div className="border-t border-[#eaecf0] bg-[#f8fafc] px-6 py-4">
              <button type="submit" className="btn-primary px-6 py-2.5 text-sm font-semibold">
                Enregistrer toutes les modifications
              </button>
            </div>
          </section>

        </form>
      )}
    </div>
  );
}
