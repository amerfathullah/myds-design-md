import { Tag } from "@/components/Tag";
import { links } from "@/lib/constant";
import { getRosetta } from "@/locales/_server";
import { i18n } from "@/i18n";
import {
  ComponentIcon,
  DocumentIcon,
  FontIcon,
  GlobeIcon,
  InfoIcon,
  SettingIcon,
  UserGroupIcon,
} from "@amerfathullah/myds-react/icon";
import type {
  BaseLayoutProps,
  LayoutTab,
  MainItemType,
} from "fumadocs-ui/layouts/shared";
import { defineI18nUI } from "fumadocs-ui/i18n";
import Image from "next/image";

/**
 * Shared layout configurations
 *
 * you can configure layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */

/**
 * Fumadocs UI strings for each locale
 */
export const i18nUI = defineI18nUI(i18n, {
  en: {
    displayName: "English",
    "Search(search trigger)": "Search",
    "Search(search dialog)": "Search",
    "No results found(search dialog)": "No results found",
    "On this page(table of contents)": "On this page",
    "No Headings(table of contents)": "No Headings",
    "Last updated on(page footer)": "Last updated on",
    "Choose a language(language switcher)": "Choose a language",
    "Next Page(pagination)": "Next",
    "Previous Page(pagination)": "Previous",
    "Toggle Theme(theme switcher)(aria-label)": "Theme",
    "Edit on GitHub(edit page)": "Edit on GitHub",
  },
  ms: {
    displayName: "Bahasa Melayu",
    "Search(search trigger)": "Cari",
    "Search(search dialog)": "Cari",
    "No results found(search dialog)": "Tiada hasil ditemui",
    "On this page(table of contents)": "Di halaman ini",
    "No Headings(table of contents)": "Tiada Tajuk",
    "Last updated on(page footer)": "Dikemaskini pada",
    "Choose a language(language switcher)": "Pilih bahasa",
    "Next Page(pagination)": "Seterusnya",
    "Previous Page(pagination)": "Sebelumnya",
    "Toggle Theme(theme switcher)(aria-label)": "Tema",
    "Edit on GitHub(edit page)": "Edit di GitHub",
  },
});

export type MYDSConfig = {
  config: BaseLayoutProps;
  menu: Array<LayoutTab>;
};

export const getMYDSConfig = (lang: "en" | "ms"): MYDSConfig => {
  const { t } = getRosetta(lang);

  const menu: Array<MainItemType & LayoutTab> = [
    {
      title: t("menu.design"),
      text: t("menu.design"),
      description: t("design.description"),
      url: `/${lang}/docs/design`,
      icon: <FontIcon />,
      active: "nested-url",
    },
    {
      title: t("menu.develop"),
      text: t("menu.develop"),
      description: t("develop.description"),
      url: `/${lang}/docs/develop`,
      icon: <GlobeIcon />,
      active: "nested-url",
    },
    {
      title: t("menu.icon"),
      text: t("menu.icon"),
      description: t("icons.description"),
      url: `/${lang}/icon`,
      icon: <ComponentIcon />,
      active: "nested-url",
    },
    {
      title: t("menu.storybook"),
      text: t("menu.storybook"),
      description: t("storybook.description"),
      url: `https://myds-storybook.vercel.app/`,
      icon: <DocumentIcon />,
      active: "nested-url",
    },
    {
      title: t("menu.community"),
      text: t("menu.community"),
      description: t("community.description"),
      url: `/${lang}/community`,
      icon: <UserGroupIcon />,
      active: "nested-url",
    },
    {
      title: t("menu.myds_ai"),
      text: t("menu.myds_ai"),
      description: t("myds_ai.description"),
      url: `https://myds-gen.vercel.app/`,
      icon: <SettingIcon />,
      active: "nested-url",
    },
    {
      title: t("menu.splask"),
      text: t("menu.splask"),
      description: t("splask.description"),
      url: `https://splask.jdn.gov.my/`,
      icon: <InfoIcon />,
      active: "nested-url",
    },
  ];

  return {
    config: {
      nav: {
        title: (
          <div className="flex items-center gap-3">
            <Image
              width={32}
              height={32}
              src="/common/logo.svg"
              alt="MYDS Logo"
            />
            <h3 className="font-heading text-[18px] font-semibold leading-[26px]">
              MYDS
            </h3>
            <Tag className="text-txt-accent text-xs">Beta</Tag>
          </div>
        ),
      },
      links: menu,
      githubUrl: links.github,
    },

    menu,
  };
};
