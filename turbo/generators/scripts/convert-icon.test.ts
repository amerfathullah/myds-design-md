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
      ),
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
    expect(svgToJsx(`<svg><path ${attribute}="1"/></svg>`)).toBe(
      `<svg {...props}><path ${prop}="1"/></svg>`,
    );
  });

  test("leaves attribute values alone, dashes and all", () => {
    expect(
      svgToJsx(
        `<svg><g id="clip-path-1" clip-path="url(#clip-path-1)"><path d="M-1 -2L3-4"/></g></svg>`,
      ),
    ).toBe(
      `<svg {...props}><g id="clip-path-1" clipPath="url(#clip-path-1)"><path d="M-1 -2L3-4"/></g></svg>`,
    );
  });

  test("leaves aria- and data- attributes dash-case, as React wants them", () => {
    expect(
      svgToJsx(`<svg aria-hidden="true"><path data-part="a"/></svg>`),
    ).toBe(`<svg aria-hidden="true" {...props}><path data-part="a"/></svg>`);
  });

  test("names class as className", () => {
    expect(svgToJsx(`<svg><path class="a"/></svg>`)).toBe(
      `<svg {...props}><path className="a"/></svg>`,
    );
  });

  test("turns a style string into an object", () => {
    expect(svgToJsx(`<svg><g style="mix-blend-mode:hard-light"/></svg>`)).toBe(
      `<svg {...props}><g style={{ mixBlendMode: "hard-light" }}/></svg>`,
    );
    expect(
      svgToJsx(
        `<svg><mask style="mask-type: alpha; -webkit-mask-clip: url(&quot;#a&quot;);--depth:2;"/></svg>`,
      ),
    ).toBe(
      `<svg {...props}><mask style={{ maskType: "alpha", WebkitMaskClip: "url(\\"#a\\")", "--depth": "2" }}/></svg>`,
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
      ),
    ).toBe(
      `<svg {...props}><path fill="currentColor" stroke="currentColor"/><path fill="#27272A" stopColor="#18181B"/></svg>`,
    );
  });

  test("reads single-quoted attributes and values holding a >", () => {
    expect(svgToJsx(`<svg><text font-family='a "b" > c'/></svg>`)).toBe(
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
});
