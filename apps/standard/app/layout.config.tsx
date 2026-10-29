import { links } from "@/lib/constant";
import type {
  BaseLayoutProps,
  LayoutTab,
  MainItemType,
} from "fumadocs-ui/layouts/shared";
import Image from "next/image";

/**
 * Shared layout configurations
 *
 * you can configure layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */

type DocsConfig = {
  config: BaseLayoutProps;
  menu: Array<LayoutTab>;
};

export const getDocsConfig = (): DocsConfig => {
  const menu: Array<MainItemType & LayoutTab> = [
    {
      title: "Prinsip Rekabentuk",
      text: "Prinsip Rekabentuk",
      description: "Prinsip & motivasi reka bentuk",
      url: "/docs/prinsip",
      active: "nested-url",
    },
    {
      title: "Arkitektur Perkhidmatan",
      text: "Arkitektur Perkhidmatan",
      description: "Arkitektur perkhidmatan",
      url: "/docs/arkitektur-perkhidmatan",
      active: "nested-url",
    },
  ];

  return {
    config: {
      nav: {
        title: (
          <div className="flex items-center gap-3">
            <Image
              width={24}
              height={24}
              src="/assets/jata-negara.png"
              alt="Jata Negara"
            />
            <h3>Panduan Reka Bentuk Perkhidmatan Digital Kerajaan</h3>
          </div>
        ),
      },
      links: menu,
      githubUrl: links.github,
    },

    menu,
  };
};
