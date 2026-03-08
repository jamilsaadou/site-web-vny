import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { naneyeGallery } from "@/lib/media";

type ComposanteIconName = "collecte" | "taxe" | "service" | "citoyen";

const dimensions = [
  {
    title: "Restauration de la confiance",
    text: "Installer une culture de transparence, d'intégrité et de responsabilité dans l'action municipale.",
  },
  {
    title: "Renouveau de la fierté civique",
    text: "Renforcer le sentiment d'appartenance des habitants à leur ville et à leurs institutions.",
  },
  {
    title: "Nouvelle gouvernance municipale",
    text: "Faire de l'intérêt citoyen le principe directeur des décisions, projets et investissements.",
  },
  {
    title: "Catalyseur de développement durable",
    text: "Créer un climat favorable à l'investissement, à l'innovation et à la participation citoyenne.",
  },
];

const composantes = [
  {
    icon: "collecte" as ComposanteIconName,
    title: "Naneye Yarda Collecte",
    text: "Modernisation de la collecte des revenus municipaux avec des mécanismes numériques de paiement des taxes et redevances.",
  },
  {
    icon: "taxe" as ComposanteIconName,
    title: "Naneye Yarda Taxe",
    text: "Transparence et efficacité dans la gestion des taxes locales avec un portail de suivi fiscal.",
  },
  {
    icon: "service" as ComposanteIconName,
    title: "Naneye Yarda Service",
    text: "Amélioration de la qualité des services municipaux grâce à la digitalisation et à l'optimisation des processus internes.",
  },
  {
    icon: "citoyen" as ComposanteIconName,
    title: "Naneye Yarda Citoyen",
    text: "Participation citoyenne active via plateformes participatives et forums réguliers dans les arrondissements.",
  },
];

const principes = [
  "Transparence des décisions et des procédures",
  "Accès simplifié aux services publics municipaux",
  "Responsabilité administrative et redevabilité",
  "Participation citoyenne dans la gouvernance locale",
  "Qualité et équité de la prestation de service",
];

function ComposanteIcon({ name }: { name: ComposanteIconName }) {
  if (name === "collecte") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7h18" />
        <path d="M7 3h10" />
        <path d="M6 7v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7" />
        <path d="M9.5 11.5h5" />
        <path d="M9.5 15.5h5" />
      </svg>
    );
  }

  if (name === "taxe") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="M8 9h8" />
        <path d="M8 13h4" />
        <circle cx="16.5" cy="13.5" r="2.5" />
      </svg>
    );
  }

  if (name === "service") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 6.5h10" />
        <rect x="4" y="9" width="16" height="10" rx="2" />
        <path d="M12 12v4" />
        <path d="M10 14h4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3" />
      <path d="M5 20c1.2-3.2 3.7-5 7-5s5.8 1.8 7 5" />
      <path d="M3 13h3" />
      <path d="M18 13h3" />
    </svg>
  );
}

export default function NaneyeYardaPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
      <section className="py-12 lg:py-16">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--green)]">Naneye Yarda</p>
          <h1 className="display-font mt-2 max-w-4xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Redéfinir la gouvernance municipale de Niamey par la confiance.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
            Naneye (en Zarma) et Yarda (en Haoussa) signifient &quot;confiance&quot;. Le programme Naneye Yarda porte une
            transformation profonde de la gouvernance municipale: plus de transparence, plus de qualité de service
            et une implication citoyenne renforcée.
          </p>

          <div className="soft-card mt-6 border-l-4 border-l-[var(--green)] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--green-deep)]">Vision stratégique</p>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)] sm:text-base">
              Naney Yarda: Redéfinir la Gouvernance Municipale de la Ville de Niamey pour un Développement Durable.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/naneye-yarda/services" className="btn-primary px-6 py-3 text-sm">
              Ouvrir le portail des services
            </Link>
            <Link href="/contact" className="btn-ghost px-6 py-3 text-sm">
              Poser une question à la mairie
            </Link>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {dimensions.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.07} className="soft-card p-6">
              <h2 className="text-xl font-extrabold text-[var(--green-deep)]">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.text}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--orange-strong)]">
            Les composantes opérationnelles
          </p>
          <h2 className="display-font mt-2 text-3xl font-extrabold sm:text-4xl">Le cadre d&apos;action Naneye Yarda</h2>
        </Reveal>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {composantes.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.07} className="soft-card p-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(19,136,74,0.25)] bg-[rgba(19,136,74,0.1)] text-[var(--green-deep)]">
                <ComposanteIcon name={item.icon} />
              </div>
              <h3 className="text-2xl font-extrabold text-[var(--green-deep)]">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.text}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal className="soft-card p-6 sm:p-7">
            <h3 className="text-2xl font-extrabold text-[var(--green-deep)]">Principes de mise en oeuvre</h3>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--muted)]">
              {principes.map((principle) => (
                <li key={principle}>- {principle}</li>
              ))}
            </ul>
          </Reveal>

          <Reveal direction="left" className="soft-card overflow-hidden">
            <div className="grid gap-0 sm:grid-cols-2">
              {naneyeGallery.slice(0, 2).map((item) => (
                <div key={item.src} className="relative h-48 sm:h-full">
                  <Image src={item.src} alt={item.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,13,8,0.5)] via-transparent to-transparent" />
                  <p className="absolute right-3 bottom-3 left-3 text-xs font-semibold text-white">{item.title}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
