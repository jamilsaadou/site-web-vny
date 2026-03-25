"use client";

import { useState } from "react";

type ArticleShareButtonsProps = {
  title: string;
  url: string;
};

type ShareLinkButtonProps = {
  href: string;
  label: string;
  children: React.ReactNode;
};

function ShareLinkButton({ href, label, children }: ShareLinkButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-semibold text-[var(--green-deep)] transition hover:-translate-y-0.5 hover:border-[rgba(19,136,74,0.3)] hover:bg-[rgba(19,136,74,0.05)]"
    >
      {children}
    </a>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.6 1.7-1.6H16V4.8c-.3 0-.9-.1-1.8-.1-1.8 0-3.1 1.1-3.1 3.3V11H8.8v3h2.3v7h2.4Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M6.9 8.1A1.56 1.56 0 1 0 6.9 5a1.56 1.56 0 0 0 0 3.1ZM5.5 9.4H8.3V19H5.5V9.4ZM9.9 9.4h2.7v1.3h.1c.4-.7 1.3-1.6 2.8-1.6 3 0 3.5 1.9 3.5 4.5V19h-2.8v-4.8c0-1.1 0-2.6-1.6-2.6s-1.8 1.2-1.8 2.5V19H9.9V9.4Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M12 4.3a7.7 7.7 0 0 0-6.7 11.6l-.9 3.3 3.4-.9A7.7 7.7 0 1 0 12 4.3Zm0 14a6.2 6.2 0 0 1-3.2-.9l-.2-.1-2 .5.5-2-.1-.2a6.1 6.1 0 1 1 5 2.7Zm3.4-4.6c-.2-.1-1.1-.5-1.3-.6s-.3-.1-.5.1-.5.6-.6.7-.2.2-.4.1a5 5 0 0 1-1.5-.9 5.6 5.6 0 0 1-1-1.3c-.1-.2 0-.3 0-.4l.3-.3.2-.3c.1-.1 0-.3 0-.4s-.5-1.2-.7-1.7c-.2-.4-.3-.4-.5-.4h-.4c-.1 0-.4 0-.6.3-.2.2-.8.8-.8 1.9s.8 2.1.9 2.2c.1.2 1.5 2.4 3.8 3.2.5.2.9.3 1.2.4.5.1 1 .1 1.4 0 .4-.1 1.1-.5 1.2-1 .2-.5.2-.9.1-1 0-.1-.2-.2-.4-.3Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M18.9 4H21l-4.6 5.2L22 20h-4.4l-3.5-4.8L9.8 20H7.7l4.9-5.6L7 4h4.5l3.1 4.4L18.9 4Zm-1.5 14.3H18L10.2 5.6h-.6l7.8 12.7Z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M14.6 3.2c.5 1.4 1.4 2.5 2.8 3.2.8.4 1.6.6 2.4.6v2.9c-.7 0-1.5-.1-2.2-.3-.9-.3-1.8-.7-2.5-1.3v6.4a5.4 5.4 0 1 1-5.4-5.4c.3 0 .7 0 1 .1v3c-.3-.1-.6-.2-1-.2a2.4 2.4 0 1 0 2.4 2.4V3.2h2.5Z" />
    </svg>
  );
}

export function ArticleShareButtons({ title, url }: ArticleShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedMessage = encodeURIComponent(`${title} ${url}`);

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const whatsAppUrl = `https://wa.me/?text=${encodedMessage}`;
  const xUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;

  const handleTikTokShare = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.open("https://www.tiktok.com/", "_blank", "noopener,noreferrer");
    } catch {
      window.prompt("Copiez ce lien pour TikTok :", url);
    }

    window.setTimeout(() => setCopied(false), 2400);
  };

  return (
    <div className="soft-card space-y-4 p-5 sm:p-6">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--orange-strong)]">Partager l&apos;article</p>
        <h2 className="text-xl font-extrabold text-[var(--green-deep)]">Diffuser cette publication</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <ShareLinkButton href={facebookUrl} label="Partager sur Facebook">
          <FacebookIcon />
          <span>Facebook</span>
        </ShareLinkButton>

        <ShareLinkButton href={linkedInUrl} label="Partager sur LinkedIn">
          <LinkedInIcon />
          <span>LinkedIn</span>
        </ShareLinkButton>

        <ShareLinkButton href={whatsAppUrl} label="Partager sur WhatsApp">
          <WhatsAppIcon />
          <span>WhatsApp</span>
        </ShareLinkButton>

        <button
          type="button"
          onClick={handleTikTokShare}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-semibold text-[var(--green-deep)] transition hover:-translate-y-0.5 hover:border-[rgba(19,136,74,0.3)] hover:bg-[rgba(19,136,74,0.05)]"
        >
          <TikTokIcon />
          <span>{copied ? "Lien copié" : "TikTok"}</span>
        </button>

        <ShareLinkButton href={xUrl} label="Partager sur X">
          <XIcon />
          <span>X</span>
        </ShareLinkButton>
      </div>

      <p className="text-xs leading-6 text-[var(--muted)]">
        Pour TikTok, le lien de l&apos;article est copié puis TikTok s&apos;ouvre dans un nouvel onglet.
      </p>
    </div>
  );
}
