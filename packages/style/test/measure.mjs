// Renders each utility in Chromium against a compiled stylesheet and reads
// back what it resolves to, in the light and the dark theme.
import { chromium } from "playwright";

// Values the radix components set at runtime, so utilities that read them resolve
const runtimeVars = `:root {
  --radix-tooltip-content-transform-origin: 10px 20px;
  --radix-accordion-content-height: 40px;
  --radix-collapsible-content-height: 40px;
}`;

/**
 * @param {string} css the compiled stylesheet
 * @param {{ utility: string, props: string[] }[]} utilities
 * @returns {Promise<Record<string, { light: object, dark: object }>>}
 */
export async function measure(css, utilities) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(
      `<!doctype html><html><head><style>${css}</style><style>${runtimeVars}</style></head><body></body></html>`,
    );
    const results = {};
    for (const theme of ["light", "dark"]) {
      const measured = await page.evaluate(readUtilities, { utilities, theme });
      for (const [utility, values] of Object.entries(measured)) {
        results[utility] ??= {};
        results[utility][theme] = values;
      }
    }
    return results;
  } finally {
    await browser.close();
  }
}

// Runs in the page
function readUtilities({ utilities, theme }) {
  document.documentElement.classList.toggle("dark", theme === "dark");

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  // Any CSS colour syntax (rgb, oklab, color-mix, …) as 8-bit RGBA
  const rgba = (color) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "rgb(1 2 3 / 0.5)";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    return a === 0 ? "transparent" : `rgba(${r}, ${g}, ${b}, ${a})`;
  };
  const splitTopLevel = (value) => {
    const parts = [];
    let depth = 0;
    let current = "";
    for (const char of value) {
      if (char === "(") depth++;
      if (char === ")") depth--;
      if (char === "," && depth === 0) {
        parts.push(current.trim());
        current = "";
      } else current += char;
    }
    parts.push(current.trim());
    return parts;
  };
  // Drop the empty layers each Tailwind version composes box-shadow from
  const shadow = (value) => {
    const layers = splitTopLevel(value).filter(
      (layer) => layer !== "none" && !/^rgba\(0, 0, 0, 0\)( 0px)+$/.test(layer),
    );
    return layers.length ? layers.join(", ") : "none";
  };
  const keyframes = (name) => {
    const find = (rules) => {
      for (const rule of rules) {
        if (rule instanceof CSSKeyframesRule && rule.name === name) return rule;
        if (rule.cssRules) {
          const found = find(rule.cssRules);
          if (found) return found;
        }
      }
    };
    for (const sheet of document.styleSheets) {
      const rule = find(sheet.cssRules);
      if (rule) return rule.cssText.replace(/\s+/g, " ");
    }
    return "none";
  };
  const round = (value) =>
    value.replace(/-?\d+\.\d+/g, (n) =>
      String(Math.round(Number(n) * 1000) / 1000),
    );
  const colorProps = new Set([
    "backgroundColor",
    "color",
    "borderTopColor",
    "outlineColor",
  ]);

  const results = {};
  for (const { utility, props } of utilities) {
    const el = document.createElement("div");
    el.className = utility;
    el.style.cssText =
      "position: absolute; left: 100px; top: 100px; width: 100px; height: 100px;";
    el.textContent = "Aa";
    document.body.append(el);

    const frame = props.find((prop) => prop.startsWith("frame:"));
    if (frame) {
      for (const animation of el.getAnimations()) {
        animation.pause();
        animation.effect.updateTiming({ fill: "both" });
        animation.currentTime =
          frame === "frame:start"
            ? 0
            : animation.effect.getComputedTiming().endTime;
      }
    }

    const style = getComputedStyle(el);
    const values = {};
    for (const prop of props) {
      if (prop.startsWith("frame:")) continue;
      if (prop === "keyframes")
        values.keyframes = keyframes(style.animationName);
      else if (prop === "box") {
        const rect = el.getBoundingClientRect();
        values.box = round(`${rect.x} ${rect.y} ${rect.width} ${rect.height}`);
      } else if (prop === "boxShadow")
        values.boxShadow = shadow(style.boxShadow);
      else if (colorProps.has(prop)) values[prop] = rgba(style[prop]);
      else values[prop] = round(style[prop]);
    }
    results[utility] = values;
    el.remove();
  }
  return results;
}
