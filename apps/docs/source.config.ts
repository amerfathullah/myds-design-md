import { defineDocs, defineConfig } from "fumadocs-mdx/config";

export const docs = defineDocs({ dir: "content/docs" });

// `package-install` code blocks are handled by the preset's remarkNpm, which
// replaces the remarkInstall plugin from fumadocs-docgen.
export default defineConfig({
  mdxOptions: {
    remarkImageOptions: {
      publicDir: "https://d2391uizq0pg2.cloudfront.net",
      useImport: false,
      // Keep building when an image size can't be fetched, as Fumadocs 14 did.
      onError: (error) => console.warn(error.message),
    },
  },
});
