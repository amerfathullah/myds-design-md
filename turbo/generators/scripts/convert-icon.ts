/**
 * Converts an icon's SVG source to a React component. The output isn't
 * formatted: the generator formats it with the repository's prettier.
 */

// Words the component name keeps upper-case: agency acronyms, mostly
const upperCaseWords = new Set([
  "spr",
  "moh",
  "moe",
  "mcmc",
  "mers",
  "pdn",
  "bnm",
  "jpj",
  "mof",
  "dosm",
  "bomba",
  "jps",
  "jpa",
  "icu",
  "jpm",
  "jpn",
  "jakoa",
  "mampu",
  "ipr",
  "epu",
  "epf",
  "kwap",
  "lhdn",
  "pdrm",
  "ntrc",
  "socso",
  "mot",
  "met",
  "unhcr",
  "perkeso",
  "rss",
  "pdf",
]);

// Public names the rules above would get wrong. `pdf` is upper-case for
// PDFMediaIcon, but the plain icon has always been PdfIcon.
const nameExceptions: Record<string, string> = {
  pdf: "Pdf",
};

/**
 * The component's name, without its `Icon` suffix, from its SVG's base name:
 * `arrow-back` is `ArrowBack`, and `legacy-book-moe` is `BookMOE`.
 */
export function componentName(source: string): string {
  return (
    nameExceptions[source] ??
    source
      .split("-")
      .map((word) =>
        upperCaseWords.has(word)
          ? word.toUpperCase()
          : word.charAt(0).toUpperCase() + word.slice(1),
      )
      .join("")
      .replace("Legacy", "")
  );
}

/**
 * A component that renders the SVG, named `${name}Icon`. If the SVG refers to
 * its own ids, the component gets the `id` that prefixes them from
 * `React.useId()`, so each copy on a page has its own; otherwise it calls no
 * hook.
 */
export function convertIcon(name: string, svg: string): string {
  const { jsx, usesId } = svgToJsx(svg);
  const ownIds = usesId
    ? `  // A prefix for the ids this SVG refers to, unique to this copy, so that
  // hiding another copy on the page can't change how this one draws
  const id = React.useId();
`
    : "";
  return `import React from "react";
import { FunctionComponent, SVGProps } from "react";

/**
 * ${name} Icon
 * @param className
 * @returns ${name}Icon
 */
export const ${name}Icon: FunctionComponent<SVGProps<SVGSVGElement>> = (props) => {
${ownIds}  return (
    ${jsx}
  );
};
`;
}

// An opening tag, whose attribute values may hold a `>`
const openingTag = /<([A-Za-z][\w:.-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
const attribute = /([^\s=/]+)=(?:"([^"]*)"|'([^']*)')/g;

// A `url()` that points into the same document, `url(#a)`, quoted or not:
// the id is group 1, 2 or 3
const localUrl = /url\(\s*(?:"#([^"]*)"|'#([^']*)'|#([^\s"')]*))\s*\)/g;

// The attributes whose value is a link, where `#a` points at the id `a`
const linkAttributes = new Set(["href", "xlink:href"]);

export interface Jsx {
  jsx: string;
  /**
   * Whether the JSX reads `id`, the prefix for this copy's own ids, which the
   * component must declare
   */
  usesId: boolean;
}

/**
 * The SVG as JSX that React accepts: attribute names in React's camelCase, a
 * `style` object, and the caller's props spread onto the root `<svg>`.
 * Attribute values stay as they are, with two exceptions:
 *
 * - the icon colour, `#18181B`, becomes `currentColor`;
 * - an id the SVG refers to, with `url(#a)` in any attribute or with
 *   `href="#a"` or `xlink:href="#a"`, is prefixed with `id`, where it's
 *   defined and wherever it's referred to. Each copy of the icon then refers
 *   only to its own clip paths, masks and gradients. Ids nothing refers to
 *   stay as they are.
 *
 * It throws if the SVG refers to an id from somewhere it can't prefix, such as
 * a `style` attribute, or to an id the SVG doesn't define, rather than leave a
 * fixed id that every copy on a page would share.
 */
export function svgToJsx(svg: string): Jsx {
  const source = svg.trim();
  const ownIds = referencedIds(source);
  let root = true;
  const jsx = source.replace(openingTag, (_, tag: string, rest: string) => {
    const selfClosing = rest.trimEnd().endsWith("/");
    const attributes = rest
      .replace(/\/\s*$/, "")
      .replace(attribute, (_, name: string, double?: string, single?: string) =>
        jsxAttribute(
          name,
          double ?? single ?? "",
          double === undefined,
          ownIds,
        ),
      );
    const props = tag === "svg" && root ? " {...props}" : "";
    root = false;
    return `<${tag}${attributes}${props}${selfClosing ? "/" : ""}>`;
  });
  return { jsx, usesId: ownIds.size > 0 };
}

/** Each attribute of each opening tag in the SVG, its value as written */
function attributesOf(svg: string): { name: string; value: string }[] {
  return [...svg.matchAll(openingTag)].flatMap(([, , rest]) =>
    [...rest!.matchAll(attribute)].map(([, name, double, single]) => ({
      name: name!,
      value: double ?? single ?? "",
    })),
  );
}

/** The ids each of the attribute's references points at, with `#` dropped */
function references(name: string, value: string): string[] {
  if (linkAttributes.has(name))
    return value.startsWith("#") ? [value.slice(1)] : [];
  return [...value.matchAll(localUrl)].map(
    ([, double, single, bare]) => double ?? single ?? bare ?? "",
  );
}

/**
 * The ids the SVG refers to, every one of which it defines. Throws for a
 * reference in a `style` attribute, which the rewrite can't reach, and for a
 * reference to an id the SVG doesn't define.
 */
function referencedIds(svg: string): Set<string> {
  const defined = new Set<string>();
  const referenced = new Set<string>();
  for (const { name, value: written } of attributesOf(svg)) {
    // Compared and rewritten as the browser reads them, entities decoded
    const value = decodeEntities(written);
    if (name === "id") defined.add(value);
    for (const target of references(name, value)) {
      if (name === "style") {
        throw new Error(
          `It refers to #${target} in a style attribute, where the generator can't give each copy of the icon its own id. Refer to it with an attribute instead, such as mask="url(#${target})".`,
        );
      }
      referenced.add(target);
    }
  }
  for (const target of referenced) {
    if (!defined.has(target)) {
      throw new Error(
        `It refers to #${target}, but no element in it has that id`,
      );
    }
  }
  return referenced;
}

function jsxAttribute(
  name: string,
  value: string,
  singleQuoted: boolean,
  ownIds: Set<string>,
) {
  if (name === "style") return `style={${styleObject(value)}}`;

  const prefixed = ownIds.size ? withOwnIds(name, value, ownIds) : undefined;
  if (prefixed !== undefined) return `${propName(name)}={\`${prefixed}\`}`;

  const quote = singleQuoted ? "'" : '"';
  const jsxValue =
    (name === "fill" || name === "stroke") && value.toUpperCase() === "#18181B"
      ? "currentColor"
      : value;
  return `${propName(name)}=${quote}${jsxValue}${quote}`;
}

/**
 * The body of a template literal that gives the attribute's value with each of
 * the copy's own ids prefixed with `${id}`, or undefined if the value holds
 * none of them. A JSX string decodes entities and a template literal doesn't,
 * so the value is decoded first.
 */
function withOwnIds(
  name: string,
  written: string,
  ownIds: Set<string>,
): string | undefined {
  const value = decodeEntities(written);
  if (name === "id") {
    return ownIds.has(value) ? `\${id}${templateText(value)}` : undefined;
  }
  if (linkAttributes.has(name)) {
    return value.startsWith("#") && ownIds.has(value.slice(1))
      ? `#\${id}${templateText(value.slice(1))}`
      : undefined;
  }

  let body = "";
  let end = 0;
  for (const match of value.matchAll(localUrl)) {
    // Every reference is to one of the copy's own ids (`referencedIds`), and
    // its `#` is the first in the match
    const [url] = match;
    const hash = url.indexOf("#") + 1;
    body +=
      templateText(value.slice(end, match.index) + url.slice(0, hash)) +
      "${id}" +
      templateText(url.slice(hash));
    end = match.index + url.length;
  }
  return end ? body + templateText(value.slice(end)) : undefined;
}

/** Text as it reads inside a template literal */
function templateText(text: string): string {
  return text.replace(/\\|`|\$(?=\{)/g, (char) => `\\${char}`);
}

function propName(name: string): string {
  if (name === "class") return "className";
  if (/^(aria|data)-/.test(name)) return name;
  return name.replace(/[-:]([a-z])/g, (_, letter: string) =>
    letter.toUpperCase(),
  );
}

/** A CSS declaration list as a React style object literal */
function styleObject(css: string): string {
  // From markup into string literals, where entities mean nothing
  const entries = declarations(decodeEntities(css))
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .map((declaration) => {
      const colon = declaration.indexOf(":");
      if (colon < 1) {
        throw new Error(`Can't read the style declaration "${declaration}"`);
      }
      const property = declaration.slice(0, colon).trim();
      const value = declaration.slice(colon + 1).trim();
      const key = property.startsWith("--")
        ? JSON.stringify(property)
        : property
            .toLowerCase()
            .replace(/^-ms-/, "ms-")
            .replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
      return `${key}: ${JSON.stringify(value)}`;
    });
  return `{ ${entries.join(", ")} }`;
}

/** A declaration list split at each `;` outside quotes and parentheses */
function declarations(css: string): string[] {
  const list: string[] = [];
  let current = "";
  let quote = "";
  let depth = 0;
  for (const char of css) {
    if (quote) {
      if (char === quote) quote = "";
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === "(") {
      depth++;
    } else if (char === ")") {
      depth = Math.max(0, depth - 1);
    } else if (char === ";" && depth === 0) {
      list.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  return [...list, current];
}

const namedEntities: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  quot: '"',
};

function decodeEntities(text: string): string {
  return text.replace(
    /&(?:#x([\da-f]+)|#(\d+)|(amp|apos|gt|lt|quot));/gi,
    (entity, hex?: string, decimal?: string, name?: string) => {
      if (hex) return String.fromCodePoint(parseInt(hex, 16));
      if (decimal) return String.fromCodePoint(parseInt(decimal, 10));
      return namedEntities[name!.toLowerCase()] ?? entity;
    },
  );
}
