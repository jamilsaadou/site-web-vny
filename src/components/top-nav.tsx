"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { label: "Accueil", href: "/" },
  { label: "Plan stratégique", href: "/plan-strategique" },
  { label: "Actualité", href: "/actualite" },
  { label: "Naneye Yarda", href: "/naneye-yarda" },
  { label: "Le centenaire", href: "/centenaire" },
  { label: "Contact", href: "/contact" },
];

function linkIsActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TopNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[rgba(255,253,248,0.92)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3.5" onClick={() => setOpen(false)}>
          <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-[rgba(19,136,74,0.28)] bg-white">
            <Image
              src="/logo-ville-niamey.png"
              alt="Logo Ville de Niamey"
              fill
              className="object-contain p-1"
              sizes="56px"
            />
          </div>
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[var(--green-deep)]">
              Ville de Niamey
            </p>
            <p className="text-xs text-[var(--muted)]">Portail municipal</p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-xl border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--green-deep)] md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          Menu
        </button>

        <div className="flex items-center gap-2">
          <nav
            id="mobile-menu"
            className={cn(
              "absolute top-[74px] right-4 left-4 rounded-2xl border border-[var(--line)] bg-white/95 p-3 shadow-xl transition-all md:static md:top-auto md:right-auto md:left-auto md:w-auto md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none",
              open
                ? "pointer-events-auto translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-4 opacity-0 md:pointer-events-auto md:translate-y-0 md:opacity-100",
            )}
          >
            <ul className="flex flex-col gap-1 md:flex-row md:items-center md:gap-1">
              {links.map((link) => {
                const active = linkIsActive(pathname, link.href);

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                        active
                          ? "bg-[rgba(240,122,20,0.14)] text-[var(--orange-strong)]"
                          : "text-[var(--text)] hover:bg-[rgba(19,136,74,0.1)] hover:text-[var(--green-deep)]",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <Link
            href="/naneye-yarda/services"
            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-[rgba(19,136,74,0.28)] bg-[rgba(19,136,74,0.08)] text-[var(--green-deep)] transition hover:border-[rgba(240,122,20,0.42)] hover:text-[var(--orange-strong)] md:inline-flex"
            aria-label="Portail services municipaux"
            title="Portail services municipaux"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
              <path d="M8 9h8M8 12h5M8 15h4" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
