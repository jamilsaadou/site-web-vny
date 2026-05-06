import type { Metadata } from "next";
import { SiteAnalytics } from "@/components/site-analytics";
import { SiteFooter } from "@/components/site-footer";
import { TopNav } from "@/components/top-nav";

export const metadata: Metadata = {
  title: "Ville de Niamey | Portail municipal",
  description:
    "Plateforme officielle de la Ville de Niamey: actualités, initiatives Naneye Yarda, centenaire et contact.",
};

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <TopNav />
      <SiteAnalytics />
      {children}
      <SiteFooter />
    </>
  );
}
