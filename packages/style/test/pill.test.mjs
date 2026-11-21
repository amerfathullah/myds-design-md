// Pill's remove button in Chromium, with real keyboard and mouse input, in
// forms that hold dismissible pills as a tags field does. The remove button
// is `type="button"` (#182), so it's never a form's default button: Enter in
// a text field submits once, through the form's own submit button wherever
// the field sits, or, in a form with one text field and no submit button,
// with no submitter, and calls no `onDismiss`. A click on a remove button
// calls its pill's `onDismiss` and submits nothing. Each check runs with an
// `onDismiss` that removes its pill, as a tags field does, and with one that
// leaves it rendered.
//
// The page is pill.page.jsx: the React components themselves, bundled with
// esbuild, on the stylesheet the Tailwind import compiles for full.css's
// sources.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";
import { chromium } from "playwright";

import { registryDefine } from "../../react/registry-define.mjs";
import { compile, fullCssSources } from "./compile.mjs";

const pageSource = fileURLToPath(new URL("./pill.page.jsx", import.meta.url));
// The page imports React and the components' dependencies from where the
// components resolve them, so the bundle has one copy of React
const reactModules = fileURLToPath(
  new URL("../../react/node_modules", import.meta.url),
);

let browser;
let html;
before(async () => {
  const [bundle, css] = await Promise.all([
    build({
      entryPoints: [pageSource],
      bundle: true,
      write: false,
      format: "iife",
      jsx: "automatic",
      nodePaths: [reactModules],
      // React's development build, so the test sees its warnings
      define: { ...registryDefine, "process.env.NODE_ENV": '"development"' },
      logLevel: "silent",
    }),
    compile(`${fullCssSources()}\n@source "${pageSource}";`),
  ]);
  const script = bundle.outputFiles[0].text.replaceAll(
    "</script",
    "<\\/script",
  );
  html = `<!doctype html><html><head><style>${css}</style></head><body class="bg-bg-white"><div id="root"></div><script>${script}</script></body></html>`;
  browser = await chromium.launch();
});
after(() => browser?.close());

// Opens the page and runs `use` on it once React has rendered it. Nothing
// logs an error or a warning.
async function withPage(use) {
  const context = await browser.newContext({
    viewport: { width: 1024, height: 768 },
  });
  try {
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (["error", "warning"].includes(message.type()))
        errors.push(message.text());
    });
    await page.setContent(html);
    await page.waitForFunction(() => window.ready.length === 1);
    const result = await use(page);
    assert.deepEqual(errors, []);
    return result;
  } finally {
    await context.close();
  }
}

// What `onDismiss` does in each run: removes its pill, or leaves it rendered
const onDismissModes = ["removes", "keeps"];

// Both pills' remove buttons, by name, as a form shows them before anything
// is removed
const bothPills = ["Buang Kuala Lumpur", "Buang Johor"];

// Waits until the form `form` has submitted or a pill in it has called
// `onDismiss`, then for two frames, so anything else either does has
// happened too
async function settle(page, form) {
  await page.waitForFunction(
    (form) =>
      window.submits.some((submit) => submit.form === form) ||
      window.dismissals.some((dismissal) => dismissal.form === form),
    form,
  );
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}

// What the form `form` has done: its submits, by their submitter's
// `data-test` or name, or null for none; the states its pills' `onDismiss`
// was called with; and the names of the remove buttons it still shows
const outcome = (page, form) =>
  page.evaluate(
    (form) => ({
      submits: window.submits
        .filter((submit) => submit.form === form)
        .map(({ submitter }) => submitter),
      dismissed: window.dismissals
        .filter((dismissal) => dismissal.form === form)
        .map(({ state }) => state),
      pills: [
        ...document.querySelectorAll(
          `[data-test="${form}"] button[aria-label]`,
        ),
      ].map((button) => button.getAttribute("aria-label")),
    }),
    form,
  );

// Presses Enter in the text field of the form `form`, and returns what the
// form did
async function enterInField(page, form) {
  await page.locator(`[data-test="${form}"] input[type=text]`).focus();
  await page.keyboard.press("Enter");
  await settle(page, form);
  return outcome(page, form);
}

for (const onDismissMode of onDismissModes) {
  test(`Enter in a text field, before or after the pills, submits once through the form's own submit button and calls no onDismiss, when onDismiss ${onDismissMode} its pill`, async () => {
    await withPage(async (page) => {
      const actual = {};
      for (const layout of ["field-first", "field-last"])
        actual[layout] = await enterInField(page, `${layout}-${onDismissMode}`);
      const submitted = {
        submits: ["submit"],
        dismissed: [],
        pills: bothPills,
      };
      assert.deepEqual(actual, {
        "field-first": submitted,
        "field-last": submitted,
      });
    });
  });

  test(`Enter in a form's one text field, with no submit button, submits once with no submitter and calls no onDismiss, when onDismiss ${onDismissMode} its pill`, async () => {
    await withPage(async (page) => {
      assert.deepEqual(await enterInField(page, `no-submit-${onDismissMode}`), {
        submits: [null],
        dismissed: [],
        pills: bothPills,
      });
    });
  });

  test(`a click on a remove button calls its pill's onDismiss and submits nothing, in every form, when onDismiss ${onDismissMode} its pill`, async () => {
    await withPage(async (page) => {
      const actual = {};
      for (const layout of ["field-first", "field-last", "no-submit"]) {
        const form = `${layout}-${onDismissMode}`;
        await page
          .locator(`[data-test="${form}"] button[aria-label="Buang Johor"]`)
          .click();
        await settle(page, form);
        actual[layout] = await outcome(page, form);
      }
      const clicked = {
        submits: [],
        dismissed: ["Johor"],
        pills: onDismissMode === "removes" ? ["Buang Kuala Lumpur"] : bothPills,
      };
      assert.deepEqual(actual, {
        "field-first": clicked,
        "field-last": clicked,
        "no-submit": clicked,
      });
    });
  });
}
