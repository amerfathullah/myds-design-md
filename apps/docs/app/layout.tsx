import "@/app/global.css";
import { clx } from "@govtechmy/myds-react/utils";
import Analytics from "@/components/analytics";
import { FunctionComponent, ReactNode } from "react";

const RootLayout: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <html
      className={clx("font-body light")}
      lang="en"
      data-scroll-behavior="smooth"
    >
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
      <Analytics />
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
