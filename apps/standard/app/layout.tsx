import "@/app/global.css";
import { RootProvider } from "fumadocs-ui/provider/next";
import { clx } from "@amerfathullah/myds-react/utils";
import Masthead from "@/components/Masthead";

import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Panduan Reka Bentuk Perkhidmatan Digital Kerajaan",
    description: "Panduan Reka Bentuk Perkhidmatan Digital Kerajaan",
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html className={clx("font-body")} lang="en" data-scroll-behavior="smooth">
      <head>
        {/* Next.js 16 (Turbopack) drops remote `@import url()` from CSS */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- the root layout covers every page */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Poppins:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap"
        />
      </head>
      <body>
        <Masthead />
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
