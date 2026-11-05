import { createI18nMiddleware } from "fumadocs-core/i18n/middleware";
import { i18n } from "@/i18n";

export const proxy = createI18nMiddleware(i18n);

export const config = {
  // Matcher ignoring `/_next/`, `/api/` and the files in public/assets,
  // public/design and public/common, which have no locale
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.ico|sitemap.xml|assets|design/|common/).*)",
  ],
};
