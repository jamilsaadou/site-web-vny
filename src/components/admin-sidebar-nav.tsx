"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminLink = {
  href: string;
  label: string;
  icon: ReactNode;
  children?: Array<{
    href: string;
    label: string;
  }>;
};

type Section = {
  label: string;
  links: AdminLink[];
};

const adminSections: Section[] = [
  {
    label: "Contenu",
    links: [
      {
        href: "/admin",
        label: "Tableau de bord",
        icon: (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" />
          </svg>
        ),
      },
      {
        href: "/admin/actualites",
        label: "Articles",
        icon: (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <path d="M8 8h8M8 12h8M8 16h5" />
          </svg>
        ),
        children: [
          { href: "/admin/actualites", label: "Nouvel article" },
          { href: "/admin/actualites/publies", label: "Tous les articles" },
        ],
      },
      {
        href: "/admin/evenements",
        label: "Événements",
        icon: (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 2v4M16 2v4" />
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18" />
          </svg>
        ),
        children: [
          { href: "/admin/evenements", label: "Nouvel événement" },
          { href: "/admin/evenements/publies", label: "Tous les événements" },
        ],
      },
      {
        href: "/admin/media",
        label: "Médiathèque",
        icon: (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3.5" y="5" width="17" height="14" rx="2" />
            <circle cx="9" cy="10" r="1.5" />
            <path d="M4.5 17l5-4 3.5 3 2.5-2 4 3" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Configuration",
    links: [
      {
        href: "/admin/config-accueil",
        label: "Page d'accueil",
        icon: (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 10.5L12 3l9 7.5V21H15v-6H9v6H3z" />
          </svg>
        ),
      },
      {
        href: "/admin/config-centenaire",
        label: "Page centenaire",
        icon: (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 3l2.2 4.8L19 8.5l-3.5 3.4.8 4.8L12 14.8l-4.3 1.9.8-4.8L5 8.5l4.8-.7L12 3z" />
          </svg>
        ),
      },
      {
        href: "/admin/parametres",
        label: "Paramètres site",
        icon: (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
            <circle cx="12" cy="12" r="3.5" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Gestion",
    links: [
      {
        href: "/admin/utilisateurs",
        label: "Utilisateurs",
        icon: (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="9" r="2.5" />
            <circle cx="16" cy="10" r="2" />
            <path d="M4.5 19a4.5 4.5 0 0 1 9 0M13 19a3.5 3.5 0 0 1 7 0" />
          </svg>
        ),
      },
      {
        href: "/admin/messages",
        label: "Messages contact",
        icon: (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 6h16v12H4z" />
            <path d="m4 7 8 6 8-6" />
          </svg>
        ),
      },
      {
        href: "/admin/logs",
        label: "Logs activité",
        icon: (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="4" y="4" width="16" height="16" rx="1" />
            <path d="M8 8h8M8 12h8M8 16h5" />
          </svg>
        ),
      },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-4 py-1">
      {adminSections.map((section) => (
        <div key={section.label}>
          <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[rgba(255,255,255,0.25)]">
            {section.label}
          </p>
          <div className="space-y-0.5">
            {section.links.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <div key={link.href} className="space-y-0.5">
                  <Link href={link.href} className={cn("wp-admin-menu-item", active && "is-active")}>
                    <span className="wp-admin-menu-icon">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>

                  {link.children?.length ? (
                    <div className="wp-admin-submenu">
                      {link.children.map((child) => {
                        const childActive = isActive(pathname, child.href);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn("wp-admin-submenu-item", childActive && "is-active")}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
