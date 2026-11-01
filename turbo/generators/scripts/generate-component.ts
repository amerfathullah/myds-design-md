/**
 * The component generator: adds a component to the react package, exports it
 * as an entry of its own, and, if asked, adds a story for it to Storybook.
 *
 * Every path comes from the repository root that turbo gen passes in. It
 * checks and prepares everything before it touches the repository, so a run
 * that fails changes nothing.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

import {
  type Formatter,
  type OutputFile,
  prettierFormatter,
} from "./generate-icons";

export interface GenerateComponentOptions {
  /** The repository root */
  root: string;
  /** The component's file name and entry, in dash-case, like `probe-x` */
  slug: string;
  /** The component's name, in PascalCase, like `ProbeX` */
  name: string;
  /** Whether to add a story for it too */
  story: boolean;
  format?: Formatter;
}

const slugPattern = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const namePattern = /^[A-Z][A-Za-z0-9]*$/;

/**
 * Why a component can't have this file name and name, or undefined if it can.
 * The name is an identifier, and the file name is the entry's subpath.
 */
export function componentNameError(
  slug: string,
  name: string,
): string | undefined {
  if (slugPattern.test(slug) && namePattern.test(name)) return undefined;
  return `Can't name a component ${JSON.stringify(slug)}: a component's name starts with a letter, and has only letters and digits, separating words with dashes, like probe-x`;
}

/**
 * Writes the component, its entry in the package's exports and, if asked, its
 * story. Resolves to a summary of what it wrote, or rejects, having changed
 * nothing, with what went wrong.
 */
export async function generateComponent({
  root,
  slug,
  name,
  story,
  format,
}: GenerateComponentOptions): Promise<string> {
  if (typeof root !== "string" || !root) {
    throw new Error(
      "turbo gen didn't pass the repository root (turbo.paths.root)",
    );
  }
  const nameError = componentNameError(slug, name);
  if (nameError) throw new Error(nameError);

  const pkg = join(root, "packages/react");
  const manifestPath = join(pkg, "package.json");
  const componentPath = join(pkg, "src/components", `${slug}.tsx`);
  const stories = join(root, "apps/storybook/stories");
  const storyPath = join(stories, `${slug}.stories.tsx`);

  const manifest = readManifest(root, manifestPath);
  const subpath = `./${slug}`;

  // A .ts file of the same name would make `../components/<slug>` ambiguous,
  // and a .ts story would give Storybook two stories of one title
  const existing = [
    componentPath,
    join(pkg, "src/components", `${slug}.ts`),
    ...(story ? [storyPath, join(stories, `${slug}.stories.ts`)] : []),
  ]
    .filter((path) => existsSync(path))
    .map((path) => relative(root, path));
  const problems = [
    ...(existing.length > 0
      ? [
          `${existing.join(", ")} ${existing.length === 1 ? "exists" : "exist"} already`,
        ]
      : []),
    ...(Object.hasOwn(manifest.exports, subpath)
      ? [`${relative(root, manifestPath)} exports ${subpath} already`]
      : []),
  ];
  if (problems.length > 0) {
    throw new Error(`Can't add the component ${slug}: ${problems.join("; ")}`);
  }

  const entry = `${manifest.name}/${slug}`;
  const files: OutputFile[] = [
    { path: componentPath, content: component(name) },
    ...(story
      ? [{ path: storyPath, content: storyOf(name, manifest.name, entry) }]
      : []),
    {
      path: manifestPath,
      content: `${JSON.stringify(
        {
          ...manifest.json,
          exports: { ...manifest.exports, [subpath]: exportsEntry(slug) },
        },
        null,
        2,
      )}\n`,
    },
  ];
  const formatted = await (format ?? prettierFormatter(root))(files);

  // Everything is ready, so only now change the repository
  for (const { path, content } of formatted) writeFileSync(path, content);
  const added = [componentPath, ...(story ? [storyPath] : [])]
    .map((path) => relative(root, path))
    .join(" and ");
  return `Added ${added}, and exported ${name} as ${entry} in ${relative(root, manifestPath)}`;
}

interface Manifest {
  json: Record<string, unknown>;
  name: string;
  exports: Record<string, unknown>;
}

function readManifest(root: string, path: string): Manifest {
  let json: unknown;
  try {
    json = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`Can't read ${relative(root, path)}: ${message(error)}`, {
      cause: error,
    });
  }
  if (!isObject(json) || typeof json.name !== "string") {
    throw new Error(`${relative(root, path)} has no package name`);
  }
  if (!isObject(json.exports)) {
    throw new Error(`${relative(root, path)} has no exports map`);
  }
  return { json, name: json.name, exports: json.exports };
}

/**
 * The component's entry, with the conditions every other entry has, pointing
 * at the files the build writes for it. Each entry keeps its `type` key: a
 * `types` key alone would make attw report it as masquerading as CJS.
 */
function exportsEntry(slug: string) {
  return {
    type: `./dist/components/${slug}.d.ts`,
    import: `./dist/components/${slug}.mjs`,
    require: `./dist/components/${slug}.js`,
  };
}

/** A component of the shape most of the package's have, like Skeleton */
function component(name: string): string {
  return `import {
  type ComponentProps,
  forwardRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from "react";
import { clx } from "../utils";

// TODO: To give ${name} props of its own, make ${name}Props an interface that
// extends ComponentProps<"div">, and describe each prop with @property.
/**
 * Props for ${name} component: a div's own props.
 * @typedef ${name}Props
 */
type ${name}Props = ComponentProps<"div">;

// TODO: Say what ${name} is for.
/**
 * ${name} component.
 */
const ${name}: ForwardRefExoticComponent<
  ${name}Props & RefAttributes<HTMLDivElement>
> = forwardRef(({ className, ...props }, ref) => {
  // TODO: Put ${name}'s own classes before className, so it overrides them.
  return <div ref={ref} className={clx(className)} {...props} />;
});
${name}.displayName = "${name}";

export { ${name} };
export type { ${name}Props };
`;
}

/**
 * The component's story, of the shape the other stories have. Its title puts
 * it with the package's other components in Storybook's sidebar.
 */
function storyOf(name: string, packageName: string, entry: string): string {
  return `import { fn } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { createStory } from "../utils";
import { ${name} } from "${entry}";

/**
 * ### Overview
 * TODO: Say what ${name} is for, and when to use it.
 *
 * ### Usage
 * \`\`\`tsx
 * import { ${name} } from "${entry}";
 *
 * <${name} />
 * \`\`\`
 */
const meta = {
  title: "${packageName}/${name}",
  component: ${name},
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: { onClick: fn() },
} satisfies Meta<typeof ${name}>;

export default meta;
type Story = StoryObj<typeof meta>;

// TODO: Add a story for each variant, and a dark one for each, like
// createStory({ ..., className: "dark" }, "dark").
export const Default: Story = createStory({
  children: "${name}",
});
`;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
