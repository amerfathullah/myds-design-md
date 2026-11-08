import { describe, expect, test } from "vitest";

import { componentName, convertIcon, svgToJsx } from "./convert-icon";

describe("componentName", () => {
  test.each([
    ["arrow-back", "ArrowBack"],
    ["lock-2", "Lock2"],
    ["rss", "RSS"],
    ["pdf-media", "PDFMedia"],
    // `pdf` is upper-case for PDFMediaIcon, but PdfIcon is a public name
    ["pdf", "Pdf"],
    ["legacy-book-moe", "BookMOE"],
    ["legacy-mini-helping-hands-icu-jpm", "MiniHelpingHandsICUJPM"],
    ["legacy-socso-perkeso", "SOCSOPERKESO"],
  ])("%s is %sIcon", (source, name) => {
    expect(componentName(source)).toBe(name);
  });
});

describe("svgToJsx", () => {
  test("spreads props onto the root svg, after its own attributes", () => {
    expect(
      svgToJsx(
        `<svg width="20" xmlns="http://www.w3.org/2000/svg"><svg width="4"/></svg>`,
      ).jsx,
    ).toBe(
      `<svg width="20" xmlns="http://www.w3.org/2000/svg" {...props}><svg width="4"/></svg>`,
    );
  });

  test.each([
    ["clip-path", "clipPath"],
    ["clip-rule", "clipRule"],
    ["fill-opacity", "fillOpacity"],
    ["fill-rule", "fillRule"],
    ["stop-color", "stopColor"],
    ["stop-opacity", "stopOpacity"],
    ["stroke-linecap", "strokeLinecap"],
    ["stroke-linejoin", "strokeLinejoin"],
    ["stroke-miterlimit", "strokeMiterlimit"],
    ["stroke-width", "strokeWidth"],
    ["xlink:href", "xlinkHref"],
    ["xml:space", "xmlSpace"],
  ])("names %s as %s", (attribute, prop) => {
    expect(svgToJsx(`<svg><path ${attribute}="1"/></svg>`).jsx).toBe(
      `<svg {...props}><path ${prop}="1"/></svg>`,
    );
  });

  test("leaves the values of an SVG that refers to none of its ids alone, dashes and all", () => {
    const { jsx, usesId } = svgToJsx(
      `<svg><g id="Icon/cross" clip-path="url(other.svg#clip-path-1)"><path d="M-1 -2L3-4"/></g></svg>`,
    );

    expect(jsx).toBe(
      `<svg {...props}><g id="Icon/cross" clipPath="url(other.svg#clip-path-1)"><path d="M-1 -2L3-4"/></g></svg>`,
    );
    expect(usesId).toBe(false);
  });

  // So two copies of an icon on a page never share an id, and a copy that's
  // hidden can't blank or distort another (#151)
  describe("prefixes each id the SVG refers to with the copy's own `id`", () => {
    test("in its definition, and in a reference before it and one after it, dashes and all", () => {
      const { jsx, usesId } = svgToJsx(
        `<svg><g clip-path="url(#clip-path-1)"><path d="M-1 -2L3-4"/></g><defs><clipPath id="clip-path-1"><rect/></clipPath></defs><g clip-path="url(#clip-path-1)"/></svg>`,
      );

      expect(jsx).toBe(
        '<svg {...props}><g clipPath={`url(#${id}clip-path-1)`}><path d="M-1 -2L3-4"/></g><defs><clipPath id={`${id}clip-path-1`}><rect/></clipPath></defs><g clipPath={`url(#${id}clip-path-1)`}/></svg>',
      );
      expect(usesId).toBe(true);
    });

    test("in a mask's and a gradient's reference, from any attribute", () => {
      expect(
        svgToJsx(
          `<svg><mask id="m"/><linearGradient id="g"/><path mask="url(#m)" fill="url(#g)" stroke="url( #g )"/></svg>`,
        ).jsx,
      ).toBe(
        "<svg {...props}><mask id={`${id}m`}/><linearGradient id={`${id}g`}/><path mask={`url(#${id}m)`} fill={`url(#${id}g)`} stroke={`url( #${id}g )`}/></svg>",
      );
    });

    test("in a quoted url(), its quotes kept", () => {
      expect(
        svgToJsx(
          `<svg><mask id="m"/><path mask="url('#m')" clip-path='url("#m")' fill="url(&quot;#m&quot;)"/></svg>`,
        ).jsx,
      ).toBe(
        '<svg {...props}><mask id={`${id}m`}/><path mask={`url(\'#${id}m\')`} clipPath={`url("#${id}m")`} fill={`url("#${id}m")`}/></svg>',
      );
    });

    test("in an href or xlink:href reference", () => {
      expect(
        svgToJsx(
          `<svg><defs><path id="shape"/></defs><use href="#shape"/><use xlink:href="#shape"/></svg>`,
        ).jsx,
      ).toBe(
        "<svg {...props}><defs><path id={`${id}shape`}/></defs><use href={`#${id}shape`}/><use xlinkHref={`#${id}shape`}/></svg>",
      );
    });

    test("leaving an id nothing refers to as it is, beside one that's referred to", () => {
      expect(
        svgToJsx(
          `<svg><g id="Icon/cross" clip-path="url(#clip0)"><path id="Vector"/></g><clipPath id="clip0"/></svg>`,
        ).jsx,
      ).toBe(
        '<svg {...props}><g id="Icon/cross" clipPath={`url(#${id}clip0)`}><path id="Vector"/></g><clipPath id={`${id}clip0`}/></svg>',
      );
    });

    test("in a value that holds what a template literal would read", () => {
      expect(
        svgToJsx(
          '<svg><mask id="a`b${c}\\d&amp;e"/><path mask="url(\'#a`b${c}\\d&amp;e\')"/></svg>',
        ).jsx,
      ).toBe(
        "<svg {...props}><mask id={`${id}a\\`b\\${c}\\\\d&e`}/><path mask={`url('#${id}a\\`b\\${c}\\\\d&e')`}/></svg>",
      );
    });
  });

  describe("refuses an SVG whose references it can't give the copy's own ids", () => {
    test("a reference in a style attribute", () => {
      expect(() =>
        svgToJsx(`<svg><mask id="m"/><g style="mask: url(#m)"/></svg>`),
      ).toThrow(/#m.*style/);
    });

    test("a reference to an id the SVG doesn't define", () => {
      expect(() =>
        svgToJsx(`<svg><g clip-path="url(#nowhere)"/></svg>`),
      ).toThrow(/#nowhere/);
      expect(() => svgToJsx(`<svg><use href="#nowhere"/></svg>`)).toThrow(
        /#nowhere/,
      );
    });
  });

  test("leaves aria- and data- attributes dash-case, as React wants them", () => {
    expect(
      svgToJsx(`<svg aria-hidden="true"><path data-part="a"/></svg>`).jsx,
    ).toBe(`<svg aria-hidden="true" {...props}><path data-part="a"/></svg>`);
  });

  test("names class as className", () => {
    expect(svgToJsx(`<svg><path class="a"/></svg>`).jsx).toBe(
      `<svg {...props}><path className="a"/></svg>`,
    );
  });

  test("turns a style string into an object", () => {
    expect(
      svgToJsx(`<svg><g style="mix-blend-mode:hard-light"/></svg>`).jsx,
    ).toBe(`<svg {...props}><g style={{ mixBlendMode: "hard-light" }}/></svg>`);
    expect(
      svgToJsx(
        `<svg><mask style="mask-type: alpha; -webkit-mask-clip: url(&quot;mask.svg#a&quot;);--depth:2;"/></svg>`,
      ).jsx,
    ).toBe(
      `<svg {...props}><mask style={{ maskType: "alpha", WebkitMaskClip: "url(\\"mask.svg#a\\")", "--depth": "2" }}/></svg>`,
    );
  });

  test("refuses a style declaration it can't read", () => {
    expect(() => svgToJsx(`<svg><g style="mix-blend-mode"/></svg>`)).toThrow(
      /mix-blend-mode/,
    );
  });

  test("paints the source's #18181B in currentColor, and no other colour", () => {
    expect(
      svgToJsx(
        `<svg><path fill="#18181B" stroke="#18181b"/><path fill="#27272A" stop-color="#18181B"/></svg>`,
      ).jsx,
    ).toBe(
      `<svg {...props}><path fill="currentColor" stroke="currentColor"/><path fill="#27272A" stopColor="#18181B"/></svg>`,
    );
  });

  test("reads single-quoted attributes and values holding a >", () => {
    expect(svgToJsx(`<svg><text font-family='a "b" > c'/></svg>`).jsx).toBe(
      `<svg {...props}><text fontFamily='a "b" > c'/></svg>`,
    );
  });
});

describe("convertIcon", () => {
  const component = convertIcon(
    "RSS",
    `<svg xmlns="http://www.w3.org/2000/svg"><path stroke-width="2"/></svg>\n`,
  );

  test("exports the component under its name", () => {
    expect(component).toContain(
      "export const RSSIcon: FunctionComponent<SVGProps<SVGSVGElement>> = (props) =>",
    );
  });

  test("names the export in its doc comment", () => {
    expect(component).toContain(
      "/**\n * RSS Icon\n * @param className\n * @returns RSSIcon\n */",
    );
  });

  test("renders the converted SVG", () => {
    expect(component).toContain(
      `<svg xmlns="http://www.w3.org/2000/svg" {...props}><path strokeWidth="2"/></svg>`,
    );
  });

  test("calls no hook when the SVG refers to none of its ids", () => {
    expect(component).not.toContain("useId");
    expect(component).toBe(`import React from "react";
import { FunctionComponent, SVGProps } from "react";

/**
 * RSS Icon
 * @param className
 * @returns RSSIcon
 */
export const RSSIcon: FunctionComponent<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props}><path strokeWidth="2"/></svg>
  );
};
`);
  });

  test("gives each copy its own `id`, from one useId() before it renders, when the SVG refers to its ids", () => {
    const clipped = convertIcon(
      "Facebook",
      `<svg><g clip-path="url(#clip0)"/><clipPath id="clip0"/></svg>`,
    );

    expect(clipped.match(/useId/g)).toEqual(["useId"]);
    expect(clipped).toContain(
      "(props) => {\n" +
        "  // A prefix for the ids this SVG refers to, unique to this copy, so that\n" +
        "  // hiding another copy on the page can't change how this one draws\n" +
        "  const id = React.useId();\n" +
        "  return (\n" +
        "    <svg {...props}><g clipPath={`url(#${id}clip0)`}/><clipPath id={`${id}clip0`}/></svg>\n" +
        "  );\n",
    );
  });
});
