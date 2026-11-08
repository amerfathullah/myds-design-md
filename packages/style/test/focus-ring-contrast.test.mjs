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

// Each surface a focus ring sits on, as the utility that fills it
const surfaces = {
  // The page, cards, fields and the Footer
  "bg-white": "bg-bg-white",
  "bg-white-hover": "bg-bg-white-hover",
  "bg-gray-50": "bg-bg-gray-50",
  // The Masthead, enclosed tabs, disabled fields, a selected pill tab
  "bg-washed": "bg-bg-washed",
  "bg-washed-active": "bg-bg-washed-active",
  // Menus, popovers, select content, dialogs and toasts
  "bg-dialog": "bg-bg-dialog",
  "bg-dialog-active": "bg-bg-dialog-active",
  // The calendar's range cells
  "bg-primary-100": "bg-bg-primary-100",
  // Callouts
  "bg-primary-50": "bg-bg-primary-50",
  "bg-danger-50": "bg-bg-danger-50",
  "bg-success-50": "bg-bg-success-50",
  "bg-warning-50": "bg-bg-warning-50",
  // The Masthead trigger's fill below `sm:`, under its inset ring
  "otl-gray-200": "bg-otl-gray-200",
};

// Each pair's cell: a 40px square of the surface with a 16px box in the
// middle, which draws the ring 3px out, from 9 to 12px in. All at whole
// pixels, so no sampled pixel is only partly covered.
const cell = 40;
const pairs = Object.keys(surfaces).flatMap((surface, row) =>
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

let browser;
let html;
before(async () => {
  const classes = [
    "bg-bg-white",
    "ring-3",
    ...Object.values(surfaces),
    ...tokens.map((token) => `ring-${token}`),
  ];
  const css = await compile(`@source inline("${classes.join(" ")}");`);
  const cells = pairs
    .map(
      ({ surface, token, x, y }) =>
        `<div data-surface="${surface}" class="${surfaces[surface]}" style="position:absolute;left:${x}px;top:${y}px;width:${cell}px;height:${cell}px"><div data-ring="${token}" class="ring-3 ring-${token}" style="position:absolute;left:12px;top:12px;width:16px;height:16px"></div></div>`,
    )
    .join("");
  html = `<!doctype html><html><head><style>${css}</style></head><body class="bg-bg-white" style="margin:0">${cells}</body></html>`;
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

// Runs in the page: whether each surface's utility fills it and each ring
// utility draws a ring, so a utility the preset doesn't generate fails
// rather than measuring the page behind it
function drawn() {
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
    assert.deepEqual(await page.evaluate(drawn), { surfaces: [], rings: [] });
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
