import type { ServiceIcon } from "@/lib/municipal-services";
import { cn } from "@/lib/utils";

type ServiceCategoryIconProps = {
  icon: ServiceIcon;
  className?: string;
};

export function ServiceCategoryIcon({ icon, className }: ServiceCategoryIconProps) {
  const common = cn("h-8 w-8", className);

  if (icon === "home") {
    return (
      <svg
        viewBox="0 0 24 24"
        className={common}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.8V21h14V9.8" />
        <path d="M9 21v-6h6v6" />
      </svg>
    );
  }

  if (icon === "transport") {
    return (
      <svg
        viewBox="0 0 24 24"
        className={common}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="8" width="16" height="8" rx="2" />
        <path d="M7 8V6h10v2" />
        <circle cx="8" cy="17" r="1.5" />
        <circle cx="16" cy="17" r="1.5" />
      </svg>
    );
  }

  if (icon === "citizen") {
    return (
      <svg
        viewBox="0 0 24 24"
        className={common}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="7" r="3" />
        <path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7" />
        <path d="M3 11h4M17 11h4" />
      </svg>
    );
  }

  if (icon === "education") {
    return (
      <svg
        viewBox="0 0 24 24"
        className={common}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 9 12 4l10 5-10 5-10-5z" />
        <path d="M6 11.5V16c0 1.8 3 3 6 3s6-1.2 6-3v-4.5" />
      </svg>
    );
  }

  if (icon === "environment") {
    return (
      <svg
        viewBox="0 0 24 24"
        className={common}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 21s7-4.5 7-11a7 7 0 0 0-14 0c0 6.5 7 11 7 11z" />
        <path d="M12 8c2.2 0 4 1.8 4 4" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className={common}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="3" />
      <path d="M5 20c1.4-3 4-5 7-5s5.6 2 7 5" />
      <path d="M3 12h3M18 12h3" />
    </svg>
  );
}
