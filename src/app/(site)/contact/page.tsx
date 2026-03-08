import Image from "next/image";
import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/reveal";

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
      <section className="py-12 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[0.45fr_0.55fr]">
          <Reveal className="soft-card p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--green)]">Contact</p>
            <h1 className="display-font mt-2 text-3xl font-extrabold sm:text-4xl">Parlons de votre projet</h1>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              La mairie de Niamey est à votre écoute pour les demandes citoyennes, les partenariats et les
              initiatives locales.
            </p>

            <div className="mt-8 space-y-3 text-sm text-[var(--muted)]">
              <p>
                <span className="font-bold text-[var(--green-deep)]">Adresse:</span> Hôtel de Ville, Niamey
              </p>
              <p>
                <span className="font-bold text-[var(--green-deep)]">Téléphone:</span> +227 20 00 00 00
              </p>
              <p>
                <span className="font-bold text-[var(--green-deep)]">Email:</span> contact@villedeniamey.ne
              </p>
            </div>

            <div className="mt-8 soft-card p-4">
              <div className="relative h-52 overflow-hidden rounded-2xl">
                <Image
                  src="/media/centenaire-3.jpg"
                  alt="Activités officielles de la Ville de Niamey"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
            </div>
          </Reveal>

          <Reveal direction="left">
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
