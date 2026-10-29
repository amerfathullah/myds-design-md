import { HomeLayout } from "fumadocs-ui/layouts/home";
import { getMYDSConfig } from "@/app/[lang]/layout.config";
import Masthead from "@/components/Masthead";

export default async function Layout({
  children,
  params,
}: LayoutProps<"/[lang]">): Promise<React.ReactElement> {
  const { lang } = (await params) as { lang: "en" | "ms" };
  const { config } = getMYDSConfig(lang);

  return (
    <div>
      <Masthead lang={lang} />
      <HomeLayout {...config}>{children}</HomeLayout>
    </div>
  );
}
