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
  const idDeclaration = usesId
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
${idDeclaration}  return (
    ${jsx}
  );
};
`;
}

// An opening tag, whose attribute values may hold a `>`
const openingTag = /<([A-Za-z][\w:.-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
// An attribute, with the whitespace before it, and its value quoted
const attribute = /(\s+)([^\s=/"'<>]+)=(?:"([^"]*)"|'([^']*)')/g;
// What follows an opening tag's name when `attribute` reads every attribute
// in it: those attributes, then the `/` of an empty element, if it has one
const readableAttributes =
  /^(?:\s+[^\s=/"'<>]+=(?:"[^"]*"|'[^']*'))*\s*(?:\/\s*)?$/;

// A `url()` that points into the same document, `url(#a)`, quoted or not:
// the id is group 1, 2 or 3
const localUrl = /url\(\s*(?:"#([^"]*)"|'#([^']*)'|#([^\s"')]*))\s*\)/g;

// An attribute whose value is a link, where `#a` points at the id `a`:
// `href`, `xlink:href`, or `href` under any other namespace prefix
const linkAttribute = /^(?:[^:]+:)?href$/i;

// Elements that can refer to an id in ways the generator doesn't read: a
// stylesheet's selectors and `url()`s, a script's lookups, and an animation's
// target and timing, such as `begin="a.end"`
const unreadElements = new Set([
  "style",
  "script",
  "animate",
  "animatecolor",
  "animatemotion",
  "animatetransform",
  "discard",
  "mpath",
  "set",
]);

// ARIA's attributes that refer to ids by name, with no `#`
const ariaIdAttributes = new Set([
  "aria-activedescendant",
  "aria-controls",
  "aria-describedby",
  "aria-details",
  "aria-errormessage",
  "aria-flowto",
  "aria-labelledby",
  "aria-owns",
]);

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
 *   only to its own clip paths, masks and gradients.
 *
 * Every other `id` attribute is dropped, with the whitespace before it. Those
 * are the source's layer names, such as `Vector` or `Icon/cross`, which would
 * repeat with every copy on a page, and which an app's own id could resolve
 * to instead. An element left with no attributes stays.
 *
 * It throws, rather than leave a fixed id that every copy on a page would
 * share, if the SVG refers to an id from somewhere it can't prefix, such as a
 * `style` attribute, or to an id the SVG doesn't define. It also throws,
 * rather than drop an id the SVG needs, for anything that might refer to an
 * id in a way it doesn't recognise: a `<style>`, `<script>` or animation
 * element, a `url(` that isn't `url(#a)`, a link that isn't `#a`, an ARIA
 * attribute that names ids, or an opening tag whose attributes it can't read
 * in full.
 */
export function svgToJsx(svg: string): Jsx {
  const source = svg.trim();
  const ownIds = referencedIds(source);
  let root = true;
  const jsx = source.replace(openingTag, (_, tag: string, rest: string) => {
    const selfClosing = rest.trimEnd().endsWith("/");
    const attributes = rest
      .replace(/\/\s*$/, "")
      .replace(
        attribute,
        (_, space: string, name: string, double?: string, single?: string) => {
          const value = double ?? single ?? "";
          if (name === "id" && !ownIds.has(decodeEntities(value))) return "";
          return (
            space + jsxAttribute(name, value, double === undefined, ownIds)
          );
        },
      );
    const props = tag === "svg" && root ? " {...props}" : "";
    root = false;
    return `<${tag}${attributes}${props}${selfClosing ? "/" : ""}>`;
  });
  return { jsx, usesId: ownIds.size > 0 };
}

interface Tag {
  /** Its name as written, with any namespace prefix */
  name: string;
  /** Its attributes, each value as written */
  attributes: { name: string; value: string }[];
}

/**
 * Each opening tag in the SVG. Throws for one with an attribute it can't read,
 * such as one with spaces around its `=` or an unquoted value, rather than
 * miss a reference in it.
 */
function tagsOf(svg: string): Tag[] {
  return [...svg.matchAll(openingTag)].map(([written, name, rest]) => {
    if (!readableAttributes.test(rest!)) {
      throw new Error(
        `Can't read every attribute of ${written}. Write each as name="value", after a space.`,
      );
    }
    return {
      name: name!,
      attributes: [...rest!.matchAll(attribute)].map(
        ([, , name, double, single]) => ({
          name: name!,
          value: double ?? single ?? "",
        }),
      ),
    };
  });
}

interface Reference {
  /** The id it points at */
  id: string;
  /** Where the id starts in the attribute's value, just after its `#` */
  at: number;
}

/**
 * The attribute's references to ids in the same SVG: each `url(#a)` in its
 * value, or the whole value of an `href` or `xlink:href` that's `#a`. The
 * value is as the browser reads it, entities decoded.
 */
function references(name: string, value: string): Reference[] {
  if (linkAttribute.test(name)) {
    return value.startsWith("#") ? [{ id: value.slice(1), at: 1 }] : [];
  }
  return [...value.matchAll(localUrl)].map((match) => {
    const [url, double, single, bare] = match;
    return {
      id: double ?? single ?? bare ?? "",
      // The match's first `#` is the reference's
      at: match.index + url.indexOf("#") + 1,
    };
  });
}

/**
 * Why the attribute might refer to an id in a way `references` doesn't read,
 * or undefined if it can't: its value is as the browser reads it, entities
 * decoded.
 */
function unrecognised(name: string, value: string): string | undefined {
  if (linkAttribute.test(name)) {
    return /^#./s.test(value)
      ? undefined
      : "a link that isn't # directly followed by an id";
  }
  if (ariaIdAttributes.has(name.toLowerCase())) {
    return "which refers to ids by name";
  }
  // Each `url(`, in any letter case and with CSS's escapes read, must start a
  // `url(#a)` that `references` reads. A `url()` to another document can
  // still name this one, by its address.
  const urls = cssUnescaped(value).match(/url\(/gi)?.length ?? 0;
  if (urls !== [...value.matchAll(localUrl)].length) {
    return "with a url() that the generator can't read as url(#a), in lower case, naming one of the SVG's own ids";
  }
  return undefined;
}

/** CSS text with its backslash escapes read, as a CSS parser reads them */
function cssUnescaped(text: string): string {
  return text.replace(
    /\\(?:([\da-f]{1,6})\s?|([^\n\da-f]))/gi,
    (_, hex?: string, char?: string) =>
      hex ? String.fromCodePoint(Math.min(parseInt(hex, 16), 0x10ffff)) : char!,
  );
}

/**
 * The ids the SVG refers to, every one of which it defines. Throws for a
 * reference in a `style` attribute, which the rewrite can't reach, and for a
 * reference to an id the SVG doesn't define.
 *
 * Every id it doesn't return is dropped, so it also throws for anything that
 * might refer to an id in a way it doesn't recognise (`unrecognised`), rather
 * than let the icon lose an id it needs with nothing to say so.
 */
function referencedIds(svg: string): Set<string> {
  const defined = new Set<string>();
  const referenced = new Set<string>();
  const attributes = tagsOf(svg).flatMap(({ name, attributes }) => {
    const element = name.slice(name.lastIndexOf(":") + 1).toLowerCase();
    if (unreadElements.has(element)) {
      throw new Error(
        `It has a <${name}> element, which can refer to an id in a way the generator doesn't read. The generator drops every id it doesn't see referred to, so it can't tell which ids to keep.`,
      );
    }
    return attributes;
  });
  for (const { name, value: written } of attributes) {
    // Compared and rewritten as the browser reads them, entities decoded
    const value = decodeEntities(written);
    if (name === "id") defined.add(value);
    const problem = unrecognised(name, value);
    if (problem) {
      throw new Error(
        `It has ${name}="${written}", ${problem}. The generator drops every id it doesn't see referred to, so it can't tell whether that would break this.`,
      );
    }
    for (const { id: target } of references(name, value)) {
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
  // An id attribute is the id's definition, which starts the value
  const ids = name === "id" ? [{ id: value, at: 0 }] : references(name, value);
  const starts = ids.filter(({ id }) => ownIds.has(id)).map(({ at }) => at);
  if (!starts.length) return undefined;
  // The value's text, cut where each id starts, with `${id}` in each cut
  return [0, ...starts]
    .map((start, index, cuts) =>
      templateText(value.slice(start, cuts[index + 1])),
    )
    .join("${id}");
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
