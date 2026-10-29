import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { getDocsConfig } from "@/app/layout.config";
import { source } from "@/app/source";
import { SidebarTabsDropdown } from "fumadocs-ui/components/sidebar/tabs/dropdown";

export default function Layout({ children }: { children: ReactNode }) {
  const { config, menu } = getDocsConfig();
  return (
    <DocsLayout
      tabs={false}
      sidebar={{
        banner: (
          <SidebarTabsDropdown
            className="bg-bg-white border-otl-gray-200 text-txt-black-700 shadow-button hover:bg-bg-white-hover hover:border-otl-gray-300 hover:text-txt-black-900 rounded-lg border"
            options={menu}
          />
        ),
      }}
      tree={source.getPageTree()}
      {...config}
      // The dropdown lists the same links, which Fumadocs 16 would repeat in the sidebar
      links={[]}
    >
      {children}
    </DocsLayout>
  );
}
