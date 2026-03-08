"use client";

import { FormEvent, useState } from "react";

type FormState = {
  fullName: string;
  email: string;
  subject: string;
  message: string;
};

const defaultValues: FormState = {
  fullName: "",
  email: "",
  subject: "",
  message: "",
};

export function ContactForm() {
  const [form, setForm] = useState<FormState>(defaultValues);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setFeedback("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Échec de l'envoi du message.");
      }

      setStatus("success");
      setFeedback(payload.message ?? "Message envoyé avec succès.");
      setForm(defaultValues);
    } catch (error) {
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : "Une erreur est survenue.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="soft-card space-y-4 p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-semibold text-[var(--green-deep)]">
          Nom complet
          <input
            required
            value={form.fullName}
            onChange={(event) => setForm((old) => ({ ...old, fullName: event.target.value }))}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text)] outline-none transition-all focus:border-[var(--orange)] focus:ring-2 focus:ring-[rgba(240,122,20,0.2)]"
            placeholder="Votre nom"
          />
        </label>

        <label className="space-y-2 text-sm font-semibold text-[var(--green-deep)]">
          E-mail
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => setForm((old) => ({ ...old, email: event.target.value }))}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text)] outline-none transition-all focus:border-[var(--green)] focus:ring-2 focus:ring-[rgba(19,136,74,0.2)]"
            placeholder="nom@exemple.com"
          />
        </label>
      </div>

      <label className="space-y-2 text-sm font-semibold text-[var(--green-deep)]">
        Sujet
        <input
          required
          value={form.subject}
          onChange={(event) => setForm((old) => ({ ...old, subject: event.target.value }))}
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text)] outline-none transition-all focus:border-[var(--orange)] focus:ring-2 focus:ring-[rgba(240,122,20,0.2)]"
          placeholder="Objet de votre message"
        />
      </label>

      <label className="space-y-2 text-sm font-semibold text-[var(--green-deep)]">
        Message
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(event) => setForm((old) => ({ ...old, message: event.target.value }))}
          className="w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text)] outline-none transition-all focus:border-[var(--green)] focus:ring-2 focus:ring-[rgba(19,136,74,0.2)]"
          placeholder="Écrivez votre message..."
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={status === "sending"} className="btn-primary px-6 py-3 text-sm">
          {status === "sending" ? "Envoi..." : "Envoyer le message"}
        </button>
        <p className="text-sm text-[var(--muted)]">Réponse de la mairie sous 48h ouvrables.</p>
      </div>

      {feedback ? (
        <p
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            status === "success"
              ? "bg-[rgba(19,136,74,0.12)] text-[var(--green-deep)]"
              : "bg-[rgba(214,101,0,0.14)] text-[var(--orange-strong)]"
          }`}
        >
          {feedback}
        </p>
      ) : null}
    </form>
  );
}
