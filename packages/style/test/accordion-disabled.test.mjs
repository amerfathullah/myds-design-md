// AccordionTrigger's disabled look, in Chromium (#226). A trigger whose own
// button is `:disabled` has `txt-black-disabled` text and chevron, a
// not-allowed cursor and no underline on hover, in both themes, open or
// closed, whatever disabled it: `disabled` on Accordion, AccordionItem or
// AccordionTrigger, or a `<fieldset disabled>` (plain, `group`, nested in
// another or disabled after mount, even with `disabled={false}` on Accordion
// and AccordionItem, and the enabled look comes back when it's enabled
// again). Radix sets `data-disabled` only from the props, and a fieldset sets
// none, so the look keys on `:disabled`. happy-dom ignores a disabled
// fieldset and applies no CSS, so this needs a real browser.
//
// A trigger that isn't `:disabled` looks enabled, even with `data-disabled`:
// `disabled={false}` or `{undefined}` on AccordionTrigger under a disabled
// AccordionItem or Accordion (#432), or a hand-passed `data-disabled`. So
// does one in the first `<legend>` of a disabled fieldset and a
// non-collapsible Accordion's open trigger, which is `aria-disabled` but not
// `:disabled`. No ancestor dims an enabled trigger's chevron: not a disabled
// outer AccordionItem, not a consumer's `group` with `data-disabled`, not one
// beside a disabled Button. An icon of the author's own in a trigger keeps
// its colour, and the author's `[&>svg]:` or text colour on the trigger
// applies while it's enabled and gives way to the dim while it's disabled.
//
// Every trigger is `:disabled`, opens on a click, takes a Tab stop and reads
// in Chromium's accessibility tree as on main. axe-core 4.10.2's
// color-contrast rule finds no violation in any fixture, in either theme.
// Nothing logs an error or a warning.
//
// Each test checks either only cases #226 changes, and fails on main, or
// only cases it leaves as they were, and passes on main too.
//
// The page is accordion-disabled.page.jsx: the React components themselves,
// bundled with esbuild, on the stylesheet the Tailwind import compiles for
// full.css's sources. accordion-disabled.cases.mjs lists its fixtures, and
// the colour classes some of them pass.
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";
import { chromium } from "playwright";

import { registryDefine } from "../../react/registry-define.mjs";
import { fixtures, triggers } from "./accordion-disabled.cases.mjs";
import { compile, fullCssSources } from "./compile.mjs";
import { colours } from "./field-looks.mjs";

const pageSource = fileURLToPath(
  new URL("./accordion-disabled.page.jsx", import.meta.url),
);
// The cases name the colour classes some fixtures pass their triggers
const casesSource = fileURLToPath(
  new URL("./accordion-disabled.cases.mjs", import.meta.url),
);
// The page imports React, Radix and the components' other dependencies from
// where the components resolve them, so the bundle has one copy of each
const reactModules = fileURLToPath(
  new URL("../../react/node_modules", import.meta.url),
);

const axeSource = fs.readFileSync(
  createRequire(import.meta.url).resolve("axe-core/axe.min.js"),
  "utf8",
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
    compile(
      `${fullCssSources()}\n@source "${pageSource}";\n@source "${casesSource}";`,
    ),
  ]);
  const script = bundle.outputFiles[0].text.replaceAll(
    "</script",
    "<\\/script",
  );
  // Transitions and animations off, so each state reads as it ends
  html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Accordion</title><style>${css}</style><style>*,::before,::after{transition:none!important;animation:none!important}</style></head><body class="bg-bg-white"><div id="root"></div><script>${script}</script></body></html>`;
  browser = await chromium.launch();
});
after(() => browser?.close());

// Waits for React and the browser to render what the page last did
const settle = (page) =>
  page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );

// Opens the page and runs `use` on it, once React has rendered it and the
// `late` fieldsets are disabled. Nothing logs an error or a warning.
async function withPage(use) {
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1200 },
  });
  try {
    const page = await context.newPage();
    const logged = [];
    page.on("pageerror", (error) => logged.push(error.message));
    page.on("console", (message) => {
      if (["error", "warning"].includes(message.type()))
        logged.push(message.text());
    });
    await page.setContent(html);
    await page.waitForFunction(() => window.ready);
    await page.evaluate(() => {
      for (const fieldset of document.querySelectorAll("[data-late]"))
        fieldset.disabled = true;
    });
    await settle(page);
    const result = await use(page);
    assert.deepEqual(logged, []);
    return result;
  } finally {
    await context.close();
  }
}

const setTheme = (page, theme) =>
  page.evaluate(
    (dark) => document.documentElement.classList.toggle("dark", dark),
    theme === "dark",
  );
const themes = ["light", "dark"];

// The computed colour of each token, in each theme: field-looks.mjs's, and
// `txt-primary`'s
const tokens = {
  light: { ...colours.light, "txt-primary": "rgb(37, 99, 235)" },
  dark: { ...colours.dark, "txt-primary": "rgb(99, 148, 255)" },
};

const locate = (page, test) => page.locator(`[data-test="${test}"]`);

// The middle of the trigger `test`, scrolled into view
async function middle(page, test) {
  const button = locate(page, test);
  await button.scrollIntoViewIfNeeded();
  const box = await button.boundingBox();
  return [box.x + box.width / 2, box.y + box.height / 2];
}

// What the trigger `test` shows: its text colour, cursor and underline, its
// chevron's colour (the button's last child), and the colour of an icon of
// the author's own, if it holds one
const readTrigger = (page, test) =>
  locate(page, test).evaluate((button) => {
    const style = getComputedStyle(button);
    const icon = button.querySelector('[data-test$="-icon"]');
    return {
      colour: style.color,
      cursor: style.cursor,
      underline: style.textDecorationLine,
      chevron: getComputedStyle(button.lastElementChild).color,
      ...(icon && { icon: getComputedStyle(icon).color }),
    };
  });

// What the trigger `test` shows at rest, with the mouse away from every
// trigger, and under a real mouse hover
async function readLook(page, test) {
  await page.mouse.move(0, 0);
  const rest = await readTrigger(page, test);
  await page.mouse.move(...(await middle(page, test)));
  const hover = await readTrigger(page, test);
  await page.mouse.move(0, 0);
  return { rest, hover };
}

// How a trigger looks in `theme`, at rest and on hover. A disabled one has
// `txt-black-disabled` text and chevron, a not-allowed cursor and no
// underline, open or closed. An enabled one has `txt-black-700` text, or the
// author's text colour, closed, `txt-black-900` open and on hover, a pointer
// and an underline on hover, and a `txt-black-500` chevron, or the author's
// `[&>svg]:` colour. An icon of the author's own keeps `txt-primary`.
function look(theme, { fixture, disabled, open }) {
  const c = tokens[theme];
  const icon = fixture.icon && { icon: c["txt-primary"] };
  if (disabled) {
    const dim = {
      colour: c["txt-black-disabled"],
      cursor: "not-allowed",
      underline: "none",
      chevron: c["txt-black-disabled"],
      ...icon,
    };
    return { rest: dim, hover: dim };
  }
  const chevron = fixture.svgClass ? c["txt-primary"] : c["txt-black-500"];
  return {
    rest: {
      colour: open
        ? c["txt-black-900"]
        : fixture.textClass
          ? c["txt-primary"]
          : c["txt-black-700"],
      cursor: "pointer",
      underline: "none",
      chevron,
      ...icon,
    },
    hover: {
      colour: c["txt-black-900"],
      cursor: "pointer",
      underline: "underline",
      chevron,
      ...icon,
    },
  };
}

// The looks of `list`, in each theme, as read and as expected
async function looks(page, list) {
  assert.ok(list.length);
  const actual = {};
  const want = {};
  for (const theme of themes) {
    await setTheme(page, theme);
    for (const trigger of list) {
      const key = `${theme} ${trigger.test}`;
      actual[key] = await readLook(page, trigger.test);
      want[key] = look(theme, trigger);
    }
  }
  return [actual, want];
}

// The tests of the looks, by topic: one of the triggers whose look #226
// changes, and one of those it keeps, where the topic has any
const topics = {
  prop: [
    "a trigger looks disabled, in both themes, at rest and on hover, with `disabled` on AccordionTrigger, and open with `disabled` on Accordion or AccordionItem: txt-black-disabled text and chevron, a not-allowed cursor and no underline",
    "a closed trigger looks disabled, in both themes, at rest and on hover, with `disabled` on Accordion or AccordionItem, as on main",
  ],
  fieldset: [
    "a trigger looks disabled, in both themes, at rest and on hover, closed and open, in a disabled fieldset: plain, group, around an enabled one, disabled after mount, and with `disabled={false}` on Accordion and AccordionItem",
  ],
  enabled: [
    undefined,
    "an enabled trigger looks enabled, in both themes, at rest and on hover, closed and open, as on main: at rest, in the first legend of a disabled fieldset (plain, group or named group), and as a non-collapsible Accordion's open trigger",
  ],
  "re-enabled": [
    "a trigger that isn't :disabled looks enabled, in both themes, at rest and on hover, closed and open, though it has data-disabled: AccordionTrigger `disabled={false}` or `{undefined}` under a disabled AccordionItem or Accordion, or a hand-passed data-disabled",
  ],
  chevron: [
    "an enabled trigger's chevron keeps txt-black-500, in both themes, at rest and on hover, inside the open item of a disabled outer Accordion and inside a group with data-disabled, and the open outer trigger looks disabled",
    "an enabled trigger's chevron keeps txt-black-500, in both themes, at rest and on hover, beside a disabled Button in a group, as on main",
  ],
  classes: [
    "the author's icon keeps its colour, and their `[&>svg]:` and text colours give way to the dim, in both themes, at rest and on hover, in a disabled fieldset and on an open trigger under a disabled AccordionItem",
    "the author's icon keeps its colour, and their `[&>svg]:` and text colours apply to an enabled trigger and give way to the dim on a closed one under a disabled AccordionItem, in both themes, at rest and on hover, as on main",
  ],
};

for (const [topic, names] of Object.entries(topics)) {
  const inTopic = triggers.filter(({ fixture }) => fixture.topic === topic);
  [true, false].forEach((changes, index) => {
    const list = inTopic.filter((trigger) => trigger.changes === changes);
    // Every trigger is in a test
    assert.equal(!!names[index], list.length > 0, `${topic} ${changes}`);
    if (names[index])
      test(names[index], () =>
        withPage(async (page) =>
          assert.deepEqual(...(await looks(page, list))),
        ),
      );
  });
}
assert.ok(
  triggers.every(({ fixture }) => fixture.topic in topics),
  "every fixture has a topic with a test",
);

test("the triggers a disabled-after-mount fieldset dims look enabled again when it's enabled again, and dim when it's disabled again, in both themes, at rest and on hover", () =>
  withPage(async (page) => {
    const late = triggers.filter(({ fixture }) => fixture.wrap === "late");
    assert.equal(late.length, 2);
    const setLate = (disabled) =>
      page.evaluate((disabled) => {
        for (const fieldset of document.querySelectorAll("[data-late]"))
          fieldset.disabled = disabled;
      }, disabled);
    const actual = [];
    const want = [];
    for (const theme of themes) {
      await setTheme(page, theme);
      for (const disabled of [true, false, true]) {
        await setLate(disabled);
        await settle(page);
        for (const trigger of late) {
          actual.push({
            theme,
            disabled,
            test: trigger.test,
            ...(await readLook(page, trigger.test)),
          });
          want.push({
            theme,
            disabled,
            test: trigger.test,
            ...look(theme, { ...trigger, disabled }),
          });
        }
      }
    }
    assert.deepEqual(actual, want);
  }));

// The name each trigger's text gives it
const names = { closed: "Closed", open: "Open", outer: "Outer" };

test("every trigger is :disabled, and reads in Chromium's accessibility tree, as on main", () =>
  withPage(async (page) => {
    const actual = {};
    const want = {};
    for (const trigger of triggers) {
      const button = locate(page, trigger.test);
      actual[trigger.test] = {
        disabled: await button.evaluate((button) =>
          button.matches(":disabled"),
        ),
        snapshot: await button.ariaSnapshot(),
      };
      want[trigger.test] = {
        disabled: trigger.disabled,
        snapshot: `- button "${names[trigger.at]}"${trigger.disabled || trigger.ariaDisabled ? " [disabled]" : ""}${trigger.open ? " [expanded]" : ""}`,
      };
    }
    assert.deepEqual(actual, want);
  }));

// Whether each trigger of `fixture` is expanded, by `data-test`
const expandedOf = (page, fixture) =>
  page.evaluate(
    (id) =>
      Object.fromEntries(
        [
          ...document.querySelectorAll(
            `[data-test="${id}"] [data-test$="-trigger"]`,
          ),
        ].map((button) => [
          button.dataset.test,
          button.getAttribute("aria-expanded") === "true",
        ]),
      ),
    fixture.id,
  );

// Clicks the trigger `test` with a real mouse. A plain click() would wait for
// a disabled trigger to be enabled.
async function click(page, test) {
  await page.mouse.click(...(await middle(page, test)));
  await settle(page);
}

test("a click toggles every trigger that isn't :disabled, but for a non-collapsible Accordion's open one, and no other, as on main", () =>
  withPage(async (page) => {
    const actual = {};
    const want = {};
    for (const fixture of fixtures) {
      const before = await expandedOf(page, fixture);
      for (const trigger of fixture.triggers) {
        const name = `${fixture.id}-${trigger.at}-trigger`;
        await click(page, name);
        actual[name] = (await expandedOf(page, fixture))[name] !== before[name];
        want[name] = !trigger.disabled && !(fixture.single && trigger.open);
        // Puts each item back as it was, the open ones first, as a single
        // Accordion opens one item by closing the other
        for (const other of [...fixture.triggers].sort(
          (a, b) => b.open - a.open,
        )) {
          const otherTest = `${fixture.id}-${other.at}-trigger`;
          if (
            (await expandedOf(page, fixture))[otherTest] !== before[otherTest]
          )
            await click(page, otherTest);
        }
        assert.deepEqual(await expandedOf(page, fixture), before, name);
      }
    }
    assert.deepEqual(actual, want);
  }));

test("Tab stops on every trigger that isn't :disabled, in order, and on no other, as on main", () =>
  withPage(async (page) => {
    await page.evaluate(() => document.getElementById("start").focus());
    const stops = [];
    for (let presses = 0; presses < 200; presses++) {
      await page.keyboard.press("Tab");
      const focused = await page.evaluate(
        () =>
          document.activeElement?.dataset.test ?? document.activeElement?.id,
      );
      if (focused === "end") break;
      stops.push(focused);
    }
    assert.deepEqual(
      stops.filter((stop) => stop?.endsWith("-trigger")),
      triggers
        .filter((trigger) => !trigger.disabled)
        .map((trigger) => trigger.test),
    );
  }));

// The colour-contrast violations axe-core finds in each fixture of `list`,
// in each theme, as found and as expected: none
async function contrast(page, list) {
  assert.ok(list.length);
  await page.addScriptTag({ content: axeSource });
  const actual = {};
  for (const theme of themes) {
    await setTheme(page, theme);
    for (const { id } of list)
      actual[`${theme} ${id}`] = await page.evaluate(async (id) => {
        const { violations } = await window.axe.run(
          { include: [[`[data-test="${id}"]`]] },
          { runOnly: ["color-contrast"] },
        );
        return violations.flatMap(({ nodes }) =>
          nodes.map(({ target, any }) => ({
            target: target.join(" "),
            ratio: any[0]?.data?.contrastRatio,
          })),
        );
      }, id);
  }
  const version = await page.evaluate(() => window.axe.version);
  return [
    { version, ...actual },
    {
      version: "4.10.2",
      ...Object.fromEntries(Object.keys(actual).map((key) => [key, []])),
    },
  ];
}

test("axe-core's color-contrast rule finds no violation, in both themes, in the fixtures where it finds none on main", () =>
  withPage(async (page) =>
    assert.deepEqual(
      ...(await contrast(
        page,
        fixtures.filter(({ axe }) => axe === "same"),
      )),
    ),
  ));

test("axe-core's color-contrast rule finds no violation, in both themes, with AccordionTrigger `disabled={false}` or `{undefined}` under a disabled AccordionItem or Accordion, or a hand-passed data-disabled", () =>
  withPage(async (page) =>
    assert.deepEqual(
      ...(await contrast(
        page,
        fixtures.filter(({ axe }) => axe === "new"),
      )),
    ),
  ));
