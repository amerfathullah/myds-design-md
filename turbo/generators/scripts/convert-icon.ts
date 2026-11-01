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

/** A component that renders the SVG, named `${name}Icon` */
export function convertIcon(name: string, svg: string): string {
  return `import React from "react";
import { FunctionComponent, SVGProps } from "react";

/**
 * ${name} Icon
 * @param className
 * @returns ${name}Icon
 */
export const ${name}Icon: FunctionComponent<SVGProps<SVGSVGElement>> = (props) => {
  return (
    ${svgToJsx(svg)}
  );
};
`;
}

// An opening tag, whose attribute values may hold a `>`
const openingTag = /<([A-Za-z][\w:.-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
const attribute = /([^\s=/]+)=(?:"([^"]*)"|'([^']*)')/g;

/**
 * The SVG as JSX that React accepts: attribute names in React's camelCase, a
 * `style` object, and the caller's props spread onto the root `<svg>`.
 * Attribute values stay as they are, except the icon colour, `#18181B`, which
 * becomes `currentColor`.
 */
export function svgToJsx(svg: string): string {
  let root = true;
  return svg.trim().replace(openingTag, (_, tag: string, rest: string) => {
    const selfClosing = rest.trimEnd().endsWith("/");
    const attributes = rest
      .replace(/\/\s*$/, "")
      .replace(attribute, (_, name: string, double?: string, single?: string) =>
        jsxAttribute(name, double ?? single ?? "", double === undefined),
      );
    const props = tag === "svg" && root ? " {...props}" : "";
    root = false;
    return `<${tag}${attributes}${props}${selfClosing ? "/" : ""}>`;
  });
}

function jsxAttribute(name: string, value: string, singleQuoted: boolean) {
  if (name === "style") return `style={${styleObject(value)}}`;

  const quote = singleQuoted ? "'" : '"';
  const color =
    (name === "fill" || name === "stroke") && value.toUpperCase() === "#18181B"
      ? "currentColor"
      : value;
  return `${propName(name)}=${quote}${color}${quote}`;
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
