import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { findMissingDesignFiles } from "./check-design-files.mjs";

// A docs app with these design guideline pages (paths under the guideline's
// content folder) and these files under public/.
async function docsApp({ pages, files = [] }) {
  const root = await mkdtemp(path.join(tmpdir(), "design-files-"));
  const contentDir = path.join(root, "content");
  const publicDir = path.join(root, "public");
  for (const [page, source] of Object.entries(pages)) {
    const file = path.join(contentDir, page);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, source);
  }
  for (const name of files) {
    const file = path.join(publicDir, name);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, "");
  }
  return { contentDir, publicDir };
}

test("names a Markdown image the repository doesn't hold, with the page that references it", async () => {
  const app = await docsApp({
    pages: { "accordion.mdx": "![anatomy](/design/accordion-anatomy.png)\n" },
    files: ["/design/accordion-anatomy-dark.png"],
  });

  assert.deepEqual(await findMissingDesignFiles(app), [
    { file: "/design/accordion-anatomy.png", pages: ["accordion.mdx"] },
  ]);
});

test("names the -dark copy the docs request for a Markdown image in the dark theme", async () => {
  const app = await docsApp({
    pages: { "accordion.mdx": "![anatomy](/design/accordion-anatomy.png)\n" },
    files: ["/design/accordion-anatomy.png"],
  });

  assert.deepEqual(await findMissingDesignFiles(app), [
    { file: "/design/accordion-anatomy-dark.png", pages: ["accordion.mdx"] },
  ]);
});

test("names an <Image> file the repository doesn't hold, and no -dark copy of it", async () => {
  const app = await docsApp({
    pages: {
      "color.mdx": `<Image
  width={680}
  height={120}
  src="/design/primitive-gray.png"
  alt="primitive-gray.png"
  className="img-light"
/>
`,
    },
  });

  assert.deepEqual(await findMissingDesignFiles(app), [
    { file: "/design/primitive-gray.png", pages: ["color.mdx"] },
  ]);
});

test("names a demo video the repository doesn't hold, with every page in a group folder that plays it", async () => {
  const video = `<video controls="true">
  <source src={s3("/design/tooltip-demo1.mov")} type="video/mp4" />
</video>
`;
  const app = await docsApp({
    pages: {
      "(components)/tooltip.mdx": video,
      "(components)/tooltip.ms.mdx": video,
    },
  });

  assert.deepEqual(await findMissingDesignFiles(app), [
    {
      file: "/design/tooltip-demo1.mov",
      pages: ["(components)/tooltip.mdx", "(components)/tooltip.ms.mdx"],
    },
  ]);
});

test("doesn't name a link or a file outside /design/", async () => {
  const app = await docsApp({
    pages: {
      "index.mdx": `[Figma](https://www.figma.com/design/BwyAzgDaGno8QhaoTtLBMx/MYDS--Beta-?node-id=7-20696)

See [Button](/docs/design/button) and [Tabs](/en/docs/design/tabs).

![logo](/common/logo.svg)
`,
    },
  });

  assert.deepEqual(await findMissingDesignFiles(app), []);
});

test("lists missing files in path order", async () => {
  const app = await docsApp({
    pages: {
      "tabs.mdx":
        "![tabs-state](/design/tabs-state.png)\n\n![tabs-anatomy](/design/tabs-anatomy.png)\n",
    },
    files: ["/design/tabs-state-dark.png", "/design/tabs-anatomy-dark.png"],
  });

  assert.deepEqual(await findMissingDesignFiles(app), [
    { file: "/design/tabs-anatomy.png", pages: ["tabs.mdx"] },
    { file: "/design/tabs-state.png", pages: ["tabs.mdx"] },
  ]);
});

test("doesn't name a file listed as known missing", async () => {
  const app = await docsApp({
    pages: { "accordion.mdx": "![anatomy](/design/accordion-anatomy.png)\n" },
    files: ["/design/accordion-anatomy.png"],
  });

  assert.deepEqual(
    await findMissingDesignFiles({
      ...app,
      knownMissing: ["/design/accordion-anatomy-dark.png"],
    }),
    [],
  );
});
