import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import {
  findMissingCommonFiles,
  findMissingDesignFiles,
} from "./check-design-files.mjs";

// Writes each source (path relative to `dir`) under `dir`.
async function writeFiles(dir, sources) {
  for (const [name, source] of Object.entries(sources)) {
    const file = path.join(dir, name);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, source);
  }
}

// An empty file at each of these paths, standing in for the files public/
// holds.
const emptyFiles = (names) =>
  Object.fromEntries(names.map((name) => [name, ""]));

// A docs app with these design guideline pages (paths under the guideline's
// content folder) and these files under public/.
async function docsApp({ pages, files = [] }) {
  const root = await mkdtemp(path.join(tmpdir(), "design-files-"));
  const contentDir = path.join(root, "content");
  const publicDir = path.join(root, "public");
  await writeFiles(contentDir, pages);
  await writeFiles(publicDir, emptyFiles(files));
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
  <source src="/design/tooltip-demo1.mov" type="video/mp4" />
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

// A docs app with these source files (paths relative to the app) and these
// files under its public/.
async function docsAppSources({ sources, files = [] }) {
  const appDir = await mkdtemp(path.join(tmpdir(), "common-files-"));
  const publicDir = path.join(appDir, "public");
  await writeFiles(appDir, sources);
  await writeFiles(publicDir, emptyFiles(files));
  return { appDir, publicDir };
}

test("names a /common/ file a docs component references that the repository doesn't hold", async () => {
  const app = await docsAppSources({
    sources: {
      "components/Footer.tsx": `<Image
  src="/common/jata-negara.png"
  width={28}
  height={28}
  alt="Jata Negara"
/>
`,
    },
  });

  assert.deepEqual(await findMissingCommonFiles(app), [
    { file: "/common/jata-negara.png", pages: ["components/Footer.tsx"] },
  ]);
});

test('names the -dark copy the home page requests for an "about" icon in the dark theme', async () => {
  const app = await docsAppSources({
    sources: {
      "components/home/About.tsx": `const dataItems = [
  {
    icon: "/common/about-icon-1.svg",
    titleKey: "Home.about.items.1.title" as const,
  },
];
`,
    },
    files: ["/common/about-icon-1.svg"],
  });

  assert.deepEqual(await findMissingCommonFiles(app), [
    {
      file: "/common/about-icon-1-dark.svg",
      pages: ["components/home/About.tsx"],
    },
  ]);
});

test("names the -dark copy the home page requests for a preview illustration in the dark theme", async () => {
  const app = await docsAppSources({
    sources: {
      "app/[lang]/(home)/page.tsx": `const previewItems = [
  {
    tagKey: "Home.previewContent.items.1.tag",
    img: {
      svg: "/common/preview-1.svg",
      altKey: "Home.previewContent.items.1.tag",
    },
  },
];
`,
    },
    files: ["/common/preview-1.svg"],
  });

  assert.deepEqual(await findMissingCommonFiles(app), [
    {
      file: "/common/preview-1-dark.svg",
      pages: ["app/[lang]/(home)/page.tsx"],
    },
  ]);
});

test("doesn't name a -dark copy of the logo or the national mark, which never request one", async () => {
  const app = await docsAppSources({
    sources: {
      "app/[lang]/layout.config.tsx": `<Image src="/common/logo.svg" width={28} height={28} alt="MYDS Logo" />\n`,
      "components/Footer.tsx": `<Image src="/common/jata-negara.png" width={28} height={28} alt="Jata Negara" />\n`,
    },
    files: ["/common/logo.svg", "/common/jata-negara.png"],
  });

  assert.deepEqual(await findMissingCommonFiles(app), []);
});

test("names a /common/ file once, with every docs page and component that references it", async () => {
  const logo = `<Image src="/common/logo.svg" width={28} height={28} alt="MYDS Logo" />\n`;
  const app = await docsAppSources({
    sources: {
      "app/[lang]/community/layout.tsx": logo,
      "app/[lang]/icon/layout.tsx": logo,
      "content/docs/develop/(components)/navbar.mdx": `<img src="/common/logo.svg" alt="MYDS Logo" />\n`,
      "lib/brand.ts": `export const logo = "/common/logo.svg";\n`,
    },
  });

  assert.deepEqual(await findMissingCommonFiles(app), [
    {
      file: "/common/logo.svg",
      pages: [
        "app/[lang]/community/layout.tsx",
        "app/[lang]/icon/layout.tsx",
        "content/docs/develop/(components)/navbar.mdx",
        "lib/brand.ts",
      ],
    },
  ]);
});

test("names the -dark copy the docs request for a /common/ Markdown image in the dark theme", async () => {
  const app = await docsAppSources({
    sources: {
      "content/docs/develop/index.mdx": "![logo](/common/logo.svg)\n",
    },
    files: ["/common/logo.svg"],
  });

  assert.deepEqual(await findMissingCommonFiles(app), [
    {
      file: "/common/logo-dark.svg",
      pages: ["content/docs/develop/index.mdx"],
    },
  ]);
});

test("doesn't name a URL, an import path or a route that ends in /common/", async () => {
  const app = await docsAppSources({
    sources: {
      "templates/login.tsx": `import { Brand } from "@/common/brand";
import { Seal } from "~/common/seal";

<img src="https://cdn.example.com/common/logo.svg" alt="MYDS Logo" />
`,
      "content/docs/develop/index.mdx":
        "See [the shared props](/docs/common/props) and [Malay](/ms/docs/common/props).\n",
    },
  });

  assert.deepEqual(await findMissingCommonFiles(app), []);
});

test("doesn't read public/, scripts/, dependencies or build output", async () => {
  const reference = `const logo = "/common/logo.svg";\n`;
  const app = await docsAppSources({
    sources: {
      "public/HorizontalCard.tsx": reference,
      "scripts/check.test.mjs": reference,
      "scripts/check.ts": reference,
      "node_modules/fumadocs-ui/dist/layout.js": reference,
      ".next/server/app/page.js": reference,
      ".source/index.ts": reference,
    },
  });

  assert.deepEqual(await findMissingCommonFiles(app), []);
});

test("doesn't name a /common/ file listed as known missing", async () => {
  const app = await docsAppSources({
    sources: {
      "components/home/About.tsx": `const dataItems = [{ icon: "/common/about-icon-1.svg" }];\n`,
    },
    files: ["/common/about-icon-1.svg"],
  });

  assert.deepEqual(
    await findMissingCommonFiles({
      ...app,
      knownMissing: ["/common/about-icon-1-dark.svg"],
    }),
    [],
  );
});
