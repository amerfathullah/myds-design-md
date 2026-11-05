import { defineDocs, defineConfig } from "fumadocs-mdx/config";
import { s3 } from "./lib/constant";

export const docs = defineDocs({ dir: "content/docs" });

interface MarkdownNode {
  type: string;
  url?: string;
  children?: MarkdownNode[];
}

// Gives a Markdown image the URL `s3()` loads it from. remark-image then reads
// the size of an image under /design/ or /common/ from public/ (its default
// `publicDir`), and fetches the size of any other image from upstream's bucket.
function remarkImageUrl() {
  const visit = (node: MarkdownNode) => {
    if (node.type === "image" && node.url?.startsWith("/")) {
      node.url = s3(node.url);
    }
    node.children?.forEach(visit);
  };
  return visit;
}

// `package-install` code blocks are handled by the preset's remarkNpm, which
// replaces the remarkInstall plugin from fumadocs-docgen.
export default defineConfig({
  mdxOptions: {
    // Before remark-image, which the preset's plugins include
    remarkPlugins: (plugins) => [remarkImageUrl, ...plugins],
    remarkImageOptions: {
      useImport: false,
      // Keep building when an image size can't be fetched, as Fumadocs 14 did.
      onError: (error) => console.warn(error.message),
    },
  },
});
