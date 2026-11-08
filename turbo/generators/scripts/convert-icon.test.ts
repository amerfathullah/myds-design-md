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
    // xlink:href as xlinkHref is under the references below: a link that
    // isn't `#a` is refused
    ["xml:space", "xmlSpace"],
  ])("names %s as %s", (attribute, prop) => {
    expect(svgToJsx(`<svg><path ${attribute}="1"/></svg>`).jsx).toBe(
      `<svg {...props}><path ${prop}="1"/></svg>`,
    );
  });

  // Figma's layer names, such as `Vector`, would repeat with every copy on a
  // page, and an app's own id could resolve to one of them (#153)
  describe("drops each id the SVG doesn't refer to", () => {
    test("every id of an SVG that refers to none, leaving its other values alone, dashes and all", () => {
      const { jsx, usesId } = svgToJsx(
        `<svg><g id="Icon/cross" stroke-dasharray="1 -2"><path id="Vector 146" d="M-1 -2L3-4"/></g></svg>`,
      );

      expect(jsx).toBe(
        `<svg {...props}><g strokeDasharray="1 -2"><path d="M-1 -2L3-4"/></g></svg>`,
      );
      expect(usesId).toBe(false);
    });

    test("an id nothing refers to, beside one that's referred to and prefixed", () => {
      const { jsx, usesId } = svgToJsx(
        `<svg><g id="Icon/cross" clip-path="url(#clip0)"><path id="Vector"/></g><clipPath id="clip0"/></svg>`,
      );

      expect(jsx).toBe(
        "<svg {...props}><g clipPath={`url(#${id}clip0)`}><path/></g><clipPath id={`${id}clip0`}/></svg>",
      );
      expect(usesId).toBe(true);
    });

    test("with the whitespace before it, wherever it sits in the tag, leaving the tag's other whitespace as it was", () => {
      expect(
        svgToJsx(
          `<svg id="root"><g id='a'><path id="b" d="M1"/><path d="M2" id="c"/><path d="M3" id="d" fill="none" /><path\n  id="e"\n  d="M4"\n/></g></svg>`,
        ).jsx,
      ).toBe(
        `<svg {...props}><g><path d="M1"/><path d="M2"/><path d="M3" fill="none" /><path\n  d="M4"\n/></g></svg>`,
      );
    });

    test("whose value only an entity-decoded reference matches, keeping it", () => {
      expect(
        svgToJsx(
          `<svg><mask id="a&amp;b"/><path id="a&amp;c" mask="url(#a&amp;b)"/></svg>`,
        ).jsx,
      ).toBe(
        "<svg {...props}><mask id={`${id}a&b`}/><path mask={`url(#${id}a&b)`}/></svg>",
      );
    });
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

    test("in a link with any namespace prefix, rather than drop the id it names", () => {
      expect(
        svgToJsx(`<svg><path id="shape"/><use xl:href="#shape"/></svg>`).jsx,
      ).toBe(
        "<svg {...props}><path id={`${id}shape`}/><use xlHref={`#${id}shape`}/></svg>",
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

  // It drops every id it doesn't see referred to, so a reference it can't
  // read would lose its id, and the icon would draw wrong with nothing to say
  // so (#153)
  describe("refuses an SVG that might refer to an id in a way it doesn't recognise", () => {
    test("a <style> element, whose rules can select an id", () => {
      expect(() =>
        svgToJsx(
          `<svg><style>#a { fill: red }</style><path id="a" d="M1"/></svg>`,
        ),
      ).toThrow(/<style>/);
      expect(() =>
        svgToJsx(`<svg><svg:STYLE>#a{}</svg:STYLE><path id="a"/></svg>`),
      ).toThrow(/<svg:STYLE>/);
    });

    test("a <script> element, which can look an id up", () => {
      expect(() =>
        svgToJsx(
          `<svg><path id="a"/><script>document.getElementById("a")</script></svg>`,
        ),
      ).toThrow(/<script>/);
    });

    test.each([
      "animate",
      "set",
      "animateMotion",
      "animateTransform",
      "mpath",
      "animateColor",
      "discard",
    ])(
      "an animation element, <%s>, which can name an id in its timing or target",
      (element) => {
        expect(() =>
          svgToJsx(
            `<svg><path id="a" d="M1"/><${element} begin="a.end"/></svg>`,
          ),
        ).toThrow(new RegExp(`<${element}>`));
      },
    );

    test.each([
      ["in upper case", `fill="URL(#a)"`],
      ["in mixed case", `clip-path="Url(#a)"`],
      ["to another document", `mask="url(other.svg#a)"`],
      ["to a data URL", `fill="url(data:image/svg+xml,a)"`],
      ["in a style attribute", `style="mask: URL(#a)"`],
      ["spelt with a CSS escape", `fill="u\\72l(#a)"`],
      ["spelt with an entity", `fill="&#x55;rl(#a)"`],
    ])("a url() it can't read as a reference to its own id, %s", (_, ref) => {
      expect(() => svgToJsx(`<svg><mask id="a"/><path ${ref}/></svg>`)).toThrow(
        /url\(/i,
      );
    });

    test.each([
      ["with a space before the #", `href=" #a"`],
      ["to another document", `href="other.svg#a"`],
      ["with no id after the #", `xlink:href="#"`],
      ["that's empty", `href=""`],
      ["with another namespace prefix", `xl:href="a"`],
    ])("an href %s", (_, ref) => {
      expect(() => svgToJsx(`<svg><path id="a"/><use ${ref}/></svg>`)).toThrow(
        /href/,
      );
    });

    test.each(["aria-labelledby", "aria-describedby", "ARIA-OWNS"])(
      "an ARIA attribute that names ids, %s",
      (name) => {
        expect(() =>
          svgToJsx(`<svg ${name}="t"><title id="t">Close</title></svg>`),
        ).toThrow(new RegExp(name));
      },
    );

    test.each([
      ["spaces around =", `<path id = "a" d="M1"/>`],
      ["an unquoted value", `<path id=a d="M1"/>`],
      ["an attribute with no value", `<path hidden id="a"/>`],
      ["no space between attributes", `<path d="M1"id="a"/>`],
    ])(
      "an opening tag whose attributes it can't read in full: %s",
      (_, tag) => {
        expect(() => svgToJsx(`<svg>${tag}</svg>`)).toThrow(/<path/);
      },
    );
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
        `<svg><mask style="mask-type: alpha; -webkit-mask-clip: border-box; font-family: &quot;A; B&quot;;--depth:2;"/></svg>`,
      ).jsx,
    ).toBe(
      `<svg {...props}><mask style={{ maskType: "alpha", WebkitMaskClip: "border-box", fontFamily: "\\"A; B\\"", "--depth": "2" }}/></svg>`,
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
