import { i18n } from "@/i18n";
import { docs } from "@/.source/server";
import { loader } from "fumadocs-core/source";

export const source = loader({
  i18n,
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});
