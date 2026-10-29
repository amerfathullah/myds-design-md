import "@/app/global.css";
import { RootProvider } from "fumadocs-ui/provider/next";
import { RosettaProvider } from "@/locales/_client";
import en from "@/locales/en";
import ms from "@/locales/ms";
import { getRosetta } from "@/locales/_server";
import type { Metadata } from "next";
import { AutoToast } from "@/components/myds";
import { i18nUI } from "@/app/[lang]/layout.config";

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = (await params) as { lang: "en" | "ms" };
  const { t } = getRosetta(lang);

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    openGraph: {
      title: t("metadata.title"),
      description: t("metadata.description"),
      siteName: t("metadata.openGraph.url.index"),
      type: "website",
      images: [
        {
          url: t("metadata.openGraph.images.1.url"),
          alt: t("metadata.openGraph.images.1.alt"),
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function RootLayout({
  params,
  children,
}: LayoutProps<"/[lang]">) {
  const { lang } = (await params) as { lang: "en" | "ms" };

  return (
    <RootProvider i18n={i18nUI.provider(lang)}>
      <RosettaProvider locales={{ en, ms }}>
        <AutoToast />
        {children}
      </RosettaProvider>
    </RootProvider>
  );
}
