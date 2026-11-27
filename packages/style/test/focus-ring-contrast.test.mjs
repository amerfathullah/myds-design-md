// The focus ring tokens, `fr-primary` and `fr-danger`, contrast at least 3:1
// with every surface a focus ring sits on, in both themes, as WCAG's SC
// 1.4.11 (Non-text Contrast, AA) asks of the visual information that shows a
// control has focus. Each ring is a 3px `ring-fr-*` box-shadow drawn on its
// surface, over the page's `bg-white`, and the test reads the pixels Chromium
// paints. So the colours come from the compiled theme, and a token given
// alpha again is measured at the colour it composites to.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { chromium } from "playwright";

import { compile } from "./compile.mjs";

const tokens = ["fr-primary", "fr-danger"];

// The token of each surface a focus ring sits on, which `bg-<token>` fills
const surfaces = [
  // The page, cards, fields and the Footer
  "bg-white",
  "bg-white-hover",
  "bg-gray-50",
  // The Masthead, enclosed tabs, disabled fields, a selected pill tab
  "bg-washed",
  "bg-washed-active",
  // Menus, popovers, select content, dialogs and toasts
  "bg-dialog",
  "bg-dialog-active",
  // The calendar's range cells
  "bg-primary-100",
  // Callouts
  "bg-primary-50",
  "bg-danger-50",
  "bg-success-50",
  "bg-warning-50",
  // The Masthead trigger's fill below `sm:`, under its inset ring
  "otl-gray-200",
];

// Each pair's cell: a 40px square of the surface with a 16px box in the
// middle, which draws the ring 3px out, from 9 to 12px in. All at whole
// pixels, so no sampled pixel is only partly covered.
const cell = 40;
const pairs = surfaces.flatMap((surface, row) =>
  tokens.map((token, column) => ({
    surface,
    token,
    x: column * cell,
    y: row * cell,
  })),
);
// A pixel of the ring, mid-way down its left side, and of the bare surface
const ringPixel = ({ x, y }) => ({ x: x + 10, y: y + 20 });
const surfacePixel = ({ x, y }) => ({ x: x + 2, y: y + 2 });

// The fills a focused filled control's ring touches, at rest and hovered. On
// those controls the ring is 2px, outside a 2px `fr-gap` band that separates
// it from the fill (#264). The fills are primitives, the same in both themes,
// except the Switch's track.
const fills = [
  // primary-fill Buttons, checked and indeterminate Checkboxes, checked
  // Radios and DataTable radios, and the Calendar's selected days, range
  // ends, months and years
  "primary-600",
  // Hovered primary-fill Buttons and checked or indeterminate Checkboxes
  "primary-700",
  // danger-fill Buttons, at rest and hovered
  "danger-600",
  "danger-700",
  // The checked Switch's track: `primary-400` in dark
  "bg-primary-600",
];
// Each fill's cell: a 40px square of the page with a 16px box of the fill in
// the middle, whose band runs from 10 to 12px in and its ring from 8 to 10px
const bands = fills.map((fill, row) => ({ fill, x: 0, y: row * cell }));
// A pixel of the fill, of the band and of the ring, mid-way down the left side
const fillPixel = ({ x, y }) => ({ x: x + 20, y: y + 20 });
const bandPixel = ({ x, y }) => ({ x: x + 11, y: y + 20 });
const bandRingPixel = ({ x, y }) => ({ x: x + 9, y: y + 20 });

let browser;
let html;
let bandHtml;
before(async () => {
  const classes = [
    "ring-3",
    "ring-2",
    "ring-offset-2",
    "ring-offset-fr-gap",
    "ring-fr-primary",
    ...surfaces.map((surface) => `bg-${surface}`),
    ...fills.map((fill) => `bg-${fill}`),
    ...tokens.map((token) => `ring-${token}`),
  ];
  const css = await compile(`@source inline("${classes.join(" ")}");`);
  const cells = pairs
    .map(
      ({ surface, token, x, y }) =>
        `<div data-surface="${surface}" class="bg-${surface}" style="position:absolute;left:${x}px;top:${y}px;width:${cell}px;height:${cell}px"><div data-ring="${token}" class="ring-3 ring-${token}" style="position:absolute;left:12px;top:12px;width:16px;height:16px"></div></div>`,
    )
    .join("");
  html = `<!doctype html><html><head><style>${css}</style></head><body class="bg-bg-white" style="margin:0">${cells}</body></html>`;
  const bandCells = bands
    .map(
      ({ fill, x, y }) =>
        `<div data-fill="${fill}" class="bg-${fill} ring-2 ring-offset-2 ring-offset-fr-gap ring-fr-primary" style="position:absolute;left:${x + 12}px;top:${y + 12}px;width:16px;height:16px"></div>`,
    )
    .join("");
  bandHtml = `<!doctype html><html><head><style>${css}</style></head><body class="bg-bg-white" style="margin:0">${bandCells}</body></html>`;
  browser = await chromium.launch();
});
after(() => browser?.close());

// WCAG 2.x relative luminance of an sRGB colour, as [r, g, b] from 0 to 255
function luminance(rgb) {
  const [r, g, b] = rgb.map((channel) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// WCAG 2.x contrast ratio between two colours
function contrast(a, b) {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (lighter + 0.05) / (darker + 0.05);
}

// Runs in the page: the surfaces their utility leaves unfilled and the ring
// tokens whose utility draws no ring, so a utility the preset doesn't
// generate fails rather than measuring the page behind it
function undrawn() {
  return {
    surfaces: [...document.querySelectorAll("[data-surface]")]
      .filter((e) => getComputedStyle(e).backgroundColor === "rgba(0, 0, 0, 0)")
      .map((e) => e.dataset.surface),
    rings: [...document.querySelectorAll("[data-ring]")]
      .filter((e) => !/ 0px 0px 0px 3px/.test(getComputedStyle(e).boxShadow))
      .map((e) => e.dataset.ring),
  };
}

// The page's pixels at `points`, as [r, g, b] from 0 to 255
async function pixels(page, points) {
  const png = await page.screenshot({ fullPage: true });
  return page.evaluate(
    async ({ src, points }) => {
      const image = new Image();
      image.src = src;
      await image.decode();
      const canvas = new OffscreenCanvas(image.width, image.height);
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0);
      return points.map(({ x, y }) => [
        ...context.getImageData(x, y, 1, 1).data.slice(0, 3),
      ]);
    },
    { src: `data:image/png;base64,${png.toString("base64")}`, points },
  );
}

test("fr-primary and fr-danger contrast at least 3:1 with every surface a focus ring sits on, in both themes", async () => {
  const page = await browser.newPage({
    viewport: { width: tokens.length * cell, height: pairs.length * cell },
  });
  await page.setContent(html);
  const below = {};
  for (const theme of ["light", "dark"]) {
    await page.evaluate(
      (dark) => document.documentElement.classList.toggle("dark", dark),
      theme === "dark",
    );
    assert.deepEqual(await page.evaluate(undrawn), {
      surfaces: [],
      rings: [],
    });
    const painted = await pixels(
      page,
      pairs.flatMap((pair) => [ringPixel(pair), surfacePixel(pair)]),
    );
    pairs.forEach(({ surface, token }, i) => {
      const ratio = contrast(painted[2 * i], painted[2 * i + 1]);
      if (ratio < 3)
        below[`${token} on ${surface} (${theme})`] = `${ratio.toFixed(2)}:1`;
    });
  }
  assert.deepEqual(below, {});
});

// Runs in the page: the fills their utility leaves unfilled, and those
// without a 2px band inside a 4px ring, so a utility the preset doesn't
// generate fails rather than measuring the page behind it
function unbanded() {
  return [...document.querySelectorAll("[data-fill]")]
    .filter((e) => {
      const { backgroundColor, boxShadow } = getComputedStyle(e);
      return (
        backgroundColor === "rgba(0, 0, 0, 0)" ||
        !/ 0px 0px 0px 2px, .* 0px 0px 0px 4px/.test(boxShadow)
      );
    })
    .map((e) => e.dataset.fill);
}

test("fr-gap contrasts at least 3:1 with every fill a focus ring touches, and fr-primary with fr-gap, in both themes", async () => {
  const page = await browser.newPage({
    viewport: { width: cell, height: bands.length * cell },
  });
  await page.setContent(bandHtml);
  const below = {};
  for (const theme of ["light", "dark"]) {
    await page.evaluate(
      (dark) => document.documentElement.classList.toggle("dark", dark),
      theme === "dark",
    );
    assert.deepEqual(await page.evaluate(unbanded), []);
    const painted = await pixels(
      page,
      bands.flatMap((band) => [
        fillPixel(band),
        bandPixel(band),
        bandRingPixel(band),
      ]),
    );
    bands.forEach(({ fill }, i) => {
      const [fillColour, band, ring] = painted.slice(3 * i, 3 * i + 3);
      const onFill = contrast(band, fillColour);
      if (onFill < 3)
        below[`fr-gap on ${fill} (${theme})`] = `${onFill.toFixed(2)}:1`;
      const onBand = contrast(ring, band);
      if (onBand < 3)
        below[`fr-primary on fr-gap, around ${fill} (${theme})`] =
          `${onBand.toFixed(2)}:1`;
    });
  }
  assert.deepEqual(below, {});
});
