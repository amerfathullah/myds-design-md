import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { getMYDSConfig } from "@/app/[lang]/layout.config";
import { source } from "@/app/[lang]/source";
import { SidebarTabsDropdown } from "fumadocs-ui/components/sidebar/tabs/dropdown";

export default async function Layout({
  children,
  params,
}: LayoutProps<"/[lang]/docs">) {
  const { lang } = (await params) as { lang: "en" | "ms" };
  const { config, menu } = getMYDSConfig(lang);
  return (
    <DocsLayout
      tabs={false}
      sidebar={{
        banner: (
          <SidebarTabsDropdown
            className="border-otl-gray-200 shadow-button hover:bg-bg-washed mx-0.5 rounded-md border transition"
            options={menu}
          />
        ),
      }}
      tree={source.getPageTree(lang)}
      {...config}
      // The dropdown lists the same links, which Fumadocs 16 would repeat in the sidebar
      links={[]}
    >
      {children}
    </DocsLayout>
  );
}
