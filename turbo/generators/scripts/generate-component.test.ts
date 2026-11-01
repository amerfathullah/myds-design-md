import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { componentNameError, generateComponent } from "./generate-component";
import { type Formatter, prettierFormatter } from "./generate-icons";

// This repository, whose prettier and react package the generator follows
const repository = join(import.meta.dirname, "../../..");

const unformatted: Formatter = async (files) => files;

/**
 * Formats each file as the repository's prettier would at the same path in
 * the repository, where its config applies
 */
const repositoryPrettier: Formatter = async (files) => {
  const formatted = await prettierFormatter(repository)(
    files.map(({ path, content }) => ({
      path: join(repository, relative(root, path)),
      content,
    })),
  );
  return formatted.map(({ content }, index) => ({
    path: files[index]!.path,
    content,
  }));
};

let root: string;

function write(files: Record<string, string>) {
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), content);
  }
}

function read(file: string): string {
  return readFileSync(join(root, file), "utf8");
}

/** Every file under the repository root, with its contents */
function snapshot(): Record<string, string> {
  return Object.fromEntries(
    readdirSync(root, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => {
        const file = join(entry.parentPath, entry.name);
        return [relative(root, file), readFileSync(file, "utf8")];
      }),
  );
}

/** A component's entry, as the react package's exports list each one */
function entry(slug: string) {
  return {
    type: `./dist/components/${slug}.d.ts`,
    import: `./dist/components/${slug}.mjs`,
    require: `./dist/components/${slug}.js`,
  };
}

const manifest = {
  name: "@amerfathullah/myds-react",
  version: "2.0.1",
  files: ["dist", "README.md"],
  exports: {
    "./utils": {
      type: "./dist/utils/index.d.ts",
      import: "./dist/utils/index.mjs",
      require: "./dist/utils/index.js",
    },
    "./skeleton": entry("skeleton"),
    "./hooks": {
      type: "./dist/hooks/index.d.ts",
      import: "./dist/hooks/index.mjs",
      require: "./dist/hooks/index.js",
    },
  },
  peerDependencies: {
    react: "^18.0.0 || ^19.0.0",
  },
};

beforeEach(() => {
  // A repository root that isn't the working directory, or above it
  root = mkdtempSync(join(tmpdir(), "component-generator-"));
  write({
    "packages/react/package.json": `${JSON.stringify(manifest, null, 2)}\n`,
    "packages/react/src/components/skeleton.tsx": "the Skeleton\n",
    "apps/storybook/stories/skeleton.stories.tsx": "Skeleton's stories\n",
    // Stories with no component of their name
    "apps/storybook/stories/article.stories.tsx": "a page's stories\n",
    "apps/storybook/stories/time-field.stories.ts": "TimeField's stories\n",
  });
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("with a story", () => {
  test("says what it wrote", async () => {
    await expect(
      generateComponent({
        root,
        slug: "probe-x",
        name: "ProbeX",
        story: true,
        format: unformatted,
      }),
    ).resolves.toBe(
      "Added packages/react/src/components/probe-x.tsx and apps/storybook/stories/probe-x.stories.tsx, and exported ProbeX as @amerfathullah/myds-react/probe-x in packages/react/package.json",
    );
  });

  test("writes the component, its story and its entry, and nothing else", async () => {
    const before = snapshot();

    await generateComponent({
      root,
      slug: "probe-x",
      name: "ProbeX",
      story: true,
      format: unformatted,
    });

    const after = snapshot();
    expect(Object.keys(after).sort()).toEqual(
      [
        ...Object.keys(before),
        "packages/react/src/components/probe-x.tsx",
        "apps/storybook/stories/probe-x.stories.tsx",
      ].sort(),
    );
    for (const [file, content] of Object.entries(before)) {
      if (file !== "packages/react/package.json") {
        expect(after[file]).toBe(content);
      }
    }
  });
});

describe("without a story", () => {
  test("says what it wrote", async () => {
    await expect(
      generateComponent({
        root,
        slug: "probe-x",
        name: "ProbeX",
        story: false,
        format: unformatted,
      }),
    ).resolves.toBe(
      "Added packages/react/src/components/probe-x.tsx, and exported ProbeX as @amerfathullah/myds-react/probe-x in packages/react/package.json",
    );
  });

  test("writes no story", async () => {
    await generateComponent({
      root,
      slug: "probe-x",
      name: "ProbeX",
      story: false,
      format: unformatted,
    });

    expect(readdirSync(join(root, "apps/storybook/stories")).sort()).toEqual([
      "article.stories.tsx",
      "skeleton.stories.tsx",
      "time-field.stories.ts",
    ]);
  });

  test("isn't stopped by a story of the same name", async () => {
    await generateComponent({
      root,
      slug: "article",
      name: "Article",
      story: false,
      format: unformatted,
    });

    expect(read("packages/react/src/components/article.tsx")).toContain(
      "const Article",
    );
    expect(read("apps/storybook/stories/article.stories.tsx")).toBe(
      "a page's stories\n",
    );
  });
});

describe("the component", () => {
  test("is a div that forwards its ref and merges its className, formatted with the repository's prettier", async () => {
    await generateComponent({
      root,
      slug: "probe-x",
      name: "ProbeX",
      story: false,
      format: repositoryPrettier,
    });

    expect(read("packages/react/src/components/probe-x.tsx")).toBe(`import {
  type ComponentProps,
  forwardRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from "react";
import { clx } from "../utils";

// TODO: To give ProbeX props of its own, make ProbeXProps an interface that
// extends ComponentProps<"div">, and describe each prop with @property.
/**
 * Props for ProbeX component: a div's own props.
 * @typedef ProbeXProps
 */
type ProbeXProps = ComponentProps<"div">;

// TODO: Say what ProbeX is for.
/**
 * ProbeX component.
 */
const ProbeX: ForwardRefExoticComponent<
  ProbeXProps & RefAttributes<HTMLDivElement>
> = forwardRef(({ className, ...props }, ref) => {
  // TODO: Put ProbeX's own classes before className, so it overrides them.
  return <div ref={ref} className={clx(className)} {...props} />;
});
ProbeX.displayName = "ProbeX";

export { ProbeX };
export type { ProbeXProps };
`);
  });
});

describe("the story", () => {
  test("renders the component, imported by name, formatted with the repository's prettier", async () => {
    await generateComponent({
      root,
      slug: "probe-x",
      name: "ProbeX",
      story: true,
      format: repositoryPrettier,
    });

    expect(read("apps/storybook/stories/probe-x.stories.tsx"))
      .toBe(`import { fn } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { createStory } from "../utils";
import { ProbeX } from "@amerfathullah/myds-react/probe-x";

/**
 * ### Overview
 * TODO: Say what ProbeX is for, and when to use it.
 *
 * ### Usage
 * \`\`\`tsx
 * import { ProbeX } from "@amerfathullah/myds-react/probe-x";
 *
 * <ProbeX />
 * \`\`\`
 */
const meta = {
  title: "@amerfathullah/myds-react/ProbeX",
  component: ProbeX,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: { onClick: fn() },
} satisfies Meta<typeof ProbeX>;

export default meta;
type Story = StoryObj<typeof meta>;

// TODO: Add a story for each variant, and a dark one for each, like
// createStory({ ..., className: "dark" }, "dark").
export const Default: Story = createStory({
  children: "ProbeX",
});
`);
  });
});

describe("the entry", () => {
  test("is listed last in the package's exports, and nothing else in package.json changes", async () => {
    await generateComponent({
      root,
      slug: "probe-x",
      name: "ProbeX",
      story: false,
      format: unformatted,
    });

    const exports = { ...manifest.exports, "./probe-x": entry("probe-x") };
    expect(read("packages/react/package.json")).toBe(
      `${JSON.stringify({ ...manifest, exports }, null, 2)}\n`,
    );
  });

  test("leaves package.json formatted with the repository's prettier", async () => {
    await generateComponent({
      root,
      slug: "probe-x",
      name: "ProbeX",
      story: false,
      format: repositoryPrettier,
    });

    const written = read("packages/react/package.json");
    const [formatted] = await prettierFormatter(repository)([
      {
        path: join(repository, "packages/react/package.json"),
        content: written,
      },
    ]);
    expect(formatted!.content).toBe(written);
    expect(JSON.parse(written).exports["./probe-x"]).toEqual(entry("probe-x"));
  });

  test("has the shape of every component entry in the react package", () => {
    const { exports } = JSON.parse(
      readFileSync(join(repository, "packages/react/package.json"), "utf8"),
    ) as { exports: Record<string, Record<string, string>> };
    const components = Object.entries(exports).filter(([, conditions]) =>
      Object.values(conditions).some((path) =>
        path.startsWith("./dist/components/"),
      ),
    );

    expect(components.length).toBeGreaterThan(0);
    for (const [subpath, conditions] of components) {
      expect(conditions).toEqual(entry(subpath.slice("./".length)));
    }
  });
});

test("hands every file it writes to the formatter, and writes what it returns", async () => {
  const seen: string[] = [];
  await generateComponent({
    root,
    slug: "probe-x",
    name: "ProbeX",
    story: true,
    format: async (files) => {
      seen.push(...files.map(({ path }) => relative(root, path)));
      return files.map((file) => ({ ...file, content: "formatted\n" }));
    },
  });

  const written = [
    "packages/react/src/components/probe-x.tsx",
    "apps/storybook/stories/probe-x.stories.tsx",
    "packages/react/package.json",
  ];
  expect(seen.sort()).toEqual([...written].sort());
  for (const file of written) expect(read(file)).toBe("formatted\n");
});

describe("changes nothing, and says why", () => {
  test.each([
    ["the component", "packages/react/src/components/probe-x.tsx"],
    [
      "a .ts file of the component's name",
      "packages/react/src/components/probe-x.ts",
    ],
    ["the story", "apps/storybook/stories/probe-x.stories.tsx"],
    [
      "a .ts story of the component's name",
      "apps/storybook/stories/probe-x.stories.ts",
    ],
  ])("when %s exists already", async (_, existing) => {
    write({ [existing]: "the existing file\n" });
    const before = snapshot();

    await expect(
      generateComponent({
        root,
        slug: "probe-x",
        name: "ProbeX",
        story: true,
        format: unformatted,
      }),
    ).rejects.toThrow(`${existing} exists already`);
    expect(snapshot()).toEqual(before);
  });

  test("when a story exists with no component of its name", async () => {
    const before = snapshot();

    await expect(
      generateComponent({
        root,
        slug: "article",
        name: "Article",
        story: true,
        format: unformatted,
      }),
    ).rejects.toThrow(
      "apps/storybook/stories/article.stories.tsx exists already",
    );
    expect(snapshot()).toEqual(before);
  });

  test("naming every file that exists already", async () => {
    write({ "packages/react/src/components/probe-x.tsx": "the component\n" });
    write({ "apps/storybook/stories/probe-x.stories.tsx": "its story\n" });

    await expect(
      generateComponent({
        root,
        slug: "probe-x",
        name: "ProbeX",
        story: true,
        format: unformatted,
      }),
    ).rejects.toThrow(
      "packages/react/src/components/probe-x.tsx, apps/storybook/stories/probe-x.stories.tsx exist already",
    );
  });

  test.each(["utils", "hooks", "skeleton"])(
    "when the package exports ./%s already",
    async (slug) => {
      rmSync(join(root, "packages/react/src/components/skeleton.tsx"));
      rmSync(join(root, "apps/storybook/stories/skeleton.stories.tsx"));
      const before = snapshot();

      await expect(
        generateComponent({
          root,
          slug,
          name: "Probe",
          story: true,
          format: unformatted,
        }),
      ).rejects.toThrow(
        `packages/react/package.json exports ./${slug} already`,
      );
      expect(snapshot()).toEqual(before);
    },
  );

  test("when package.json can't be read", async () => {
    rmSync(join(root, "packages/react/package.json"));
    const before = snapshot();

    await expect(
      generateComponent({
        root,
        slug: "probe-x",
        name: "ProbeX",
        story: true,
        format: unformatted,
      }),
    ).rejects.toThrow("Can't read packages/react/package.json");
    expect(snapshot()).toEqual(before);
  });

  test("when package.json isn't JSON", async () => {
    write({ "packages/react/package.json": "{ not JSON" });
    const before = snapshot();

    await expect(
      generateComponent({
        root,
        slug: "probe-x",
        name: "ProbeX",
        story: true,
        format: unformatted,
      }),
    ).rejects.toThrow("Can't read packages/react/package.json");
    expect(snapshot()).toEqual(before);
  });

  test("when package.json has no exports map", async () => {
    write({
      "packages/react/package.json": `${JSON.stringify({ name: "@amerfathullah/myds-react" }, null, 2)}\n`,
    });
    const before = snapshot();

    await expect(
      generateComponent({
        root,
        slug: "probe-x",
        name: "ProbeX",
        story: true,
        format: unformatted,
      }),
    ).rejects.toThrow("packages/react/package.json has no exports map");
    expect(snapshot()).toEqual(before);
  });

  test("when formatting fails", async () => {
    const before = snapshot();

    await expect(
      generateComponent({
        root,
        slug: "probe-x",
        name: "ProbeX",
        story: true,
        format: async () => {
          throw new Error("prettier can't parse this");
        },
      }),
    ).rejects.toThrow("prettier can't parse this");
    expect(snapshot()).toEqual(before);
  });

  test("when the name won't do", async () => {
    const before = snapshot();

    await expect(
      generateComponent({
        root,
        slug: "2fa",
        name: "2fa",
        story: true,
        format: unformatted,
      }),
    ).rejects.toThrow(componentNameError("2fa", "2fa"));
    expect(snapshot()).toEqual(before);
  });

  test("when turbo gives it no repository root", async () => {
    await expect(
      generateComponent({
        root: undefined as unknown as string,
        slug: "probe-x",
        name: "ProbeX",
        story: true,
        format: unformatted,
      }),
    ).rejects.toThrow(
      "turbo gen didn't pass the repository root (turbo.paths.root)",
    );
  });
});

describe("a name", () => {
  test.each([
    ["probe", "Probe"],
    ["probe-x", "ProbeX"],
    ["date-field2", "DateField2"],
    ["h1-title", "H1Title"],
  ])("like %s is fine", (slug, name) => {
    expect(componentNameError(slug, name)).toBeUndefined();
  });

  test.each([
    ["", ""],
    ["2fa", "2fa"],
    ["àbc", "Àbc"],
    ["probe-", "Probe"],
    ["probe--x", "ProbeX"],
    ["probe-x", "probeX"],
    ["probe-x", "Probe$X"],
  ])("like %j, %j won't do", (slug, name) => {
    expect(componentNameError(slug, name)).toMatch(
      /letter.*letters and digits/,
    );
  });
});
