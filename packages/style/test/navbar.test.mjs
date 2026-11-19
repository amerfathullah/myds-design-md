// The Navbar's mobile menu in Chromium, with real keyboard, mouse and touch
// input, on the compiled stylesheet (#162). Below `xl:` (1280px), NavbarMenu's
// items open in a mobile menu, which NavbarAction's toggle opens and closes.
// Opening it with Enter focuses its first item, whatever kind it is, and that
// item shows its focus ring. While it's open, Tab and Shift+Tab cycle through
// its items, in DOM order, and the toggle, an open dropdown's links included,
// and the menu's panel never holds focus. Escape, the overlay and the toggle
// close it and leave focus on the toggle, even after focus has visited the
// toggle and gone back into the menu; a click elsewhere on the page leaves
// focus where it was clicked. A Dialog opened from the menu keeps its own Tab
// order. From `xl:` up, the desktop menu's Tab order is as it was. The
// menu's panel is a dialog the accessibility tree names after the toggle,
// "Menu", or what an `aria-label` on NavbarAction renames both to (#169).
//
// The page is navbar.page.jsx: the React components themselves, bundled with
// esbuild, on the stylesheet the Tailwind import compiles for full.css's
// sources.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";
import { chromium } from "playwright";

import { registryDefine } from "../../react/registry-define.mjs";
import { compile, fullCssSources } from "./compile.mjs";

const pageSource = fileURLToPath(new URL("./navbar.page.jsx", import.meta.url));
// The page imports React and the components' dependencies from where the
// components resolve them, so the bundle has one copy of React
const reactModules = fileURLToPath(
  new URL("../../react/node_modules", import.meta.url),
);

const phone = { width: 390, height: 844 };
const desktop = { width: 1440, height: 900 };
const themes = ["light", "dark"];
const pageUrl = "http://navbar.test/";

let browser;
let css;
let script;
before(async () => {
  const [bundle, compiled] = await Promise.all([
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
  css = compiled;
  script = bundle.outputFiles[0].text.replaceAll("</script", "<\\/script");
  browser = await chromium.launch();
});
after(() => browser?.close());

// Transitions and animations off, so each state reads as it ends
const still =
  "*,::before,::after{transition:none!important;animation:none!important}";

// Opens the page with the menu `menu` (see navbar.page.jsx) at `viewport`,
// in `theme`, with `label` as the toggle's `aria-label` when it's given, and
// runs `use` on it once React has rendered it. `hasTouch` gives the page a
// touchscreen, and `forcedColors` is Playwright's option, "active" for
// forced colours. Nothing logs an error or a warning.
async function withPage(
  use,
  {
    menu = "a",
    label,
    viewport = phone,
    theme = "light",
    hasTouch = false,
    forcedColors = "none",
  } = {},
) {
  // Reduced motion, so the page's smooth scrolling doesn't delay a scroll
  const context = await browser.newContext({
    viewport,
    hasTouch,
    forcedColors,
    reducedMotion: "reduce",
  });
  try {
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (["error", "warning"].includes(message.type()))
        errors.push(message.text());
    });
    await page.route(`${pageUrl}?*`, (route) =>
      route.fulfill({
        contentType: "text/html; charset=utf-8",
        body: `<!doctype html><html class="${theme === "dark" ? "dark" : ""}"><head><style>${css}</style><style>${still}</style></head><body class="bg-bg-white"><div id="root"></div><script>${script}</script></body></html>`,
      }),
    );
    const query = new URLSearchParams({ menu });
    if (label !== undefined) query.set("label", label);
    await page.goto(`${pageUrl}?${query}`);
    await page.waitForFunction(() => window.ready.length === 1);
    const result = await use(page);
    assert.deepEqual(errors, []);
    return result;
  } finally {
    await context.close();
  }
}

const toggle = "[data-test=toggle]";
// The mobile menu's panel, the PopoverContent, inside the popper Radix
// renders in a portal, and the list in it
const panel = "[data-radix-popper-content-wrapper] > *";
const list = `${panel} ul`;

// Runs in the page: what has focus, as a name the tests read. "toggle" is
// NavbarAction's toggle, and "panel" the mobile menu's panel. An item in the
// mobile menu is named by its text, or by its `data-test`. Anything else in
// the header starts with "header", and anything in a dialog other than the
// panel with "dialog".
function readFocus() {
  const element = document.activeElement;
  if (!element || element === document.body) return "body";
  const name = element.dataset.test || element.textContent.trim();
  if (element.matches("[data-test=toggle]")) return "toggle";
  if (element.matches("[data-radix-popper-content-wrapper] > *"))
    return "panel";
  if (element.closest("[data-radix-popper-content-wrapper]")) return name;
  if (element.closest("header")) return `header ${name}`;
  if (element.closest("[role=dialog]")) return `dialog ${name}`;
  return name;
}
const focused = (page) => page.evaluate(readFocus);

// The role and name Chromium's accessibility tree gives the element
// `selector` matches on `page`
async function treeNode(page, selector) {
  const client = await page.context().newCDPSession(page);
  try {
    const {
      result: { objectId },
    } = await client.send("Runtime.evaluate", {
      expression: `document.querySelector(${JSON.stringify(selector)})`,
    });
    const {
      nodes: [node],
    } = await client.send("Accessibility.getPartialAXTree", {
      objectId,
      fetchRelatives: false,
    });
    return { role: node.role?.value, name: node.name?.value };
  } finally {
    await client.detach();
  }
}

// Waits for two frames, so effects and focus moves have run
const frames = (page) =>
  page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );

// Presses `key` `count` times, and returns what has focus after each press
async function presses(page, key, count) {
  const seen = [];
  for (let pressed = 0; pressed < count; pressed++) {
    await page.keyboard.press(key);
    seen.push(await focused(page));
  }
  return seen;
}

// Opens the menu from the keyboard: Tab from the button before the Navbar
// to the toggle, past the logo, then Enter. Returns what has focus.
async function openWithEnter(page) {
  await page.focus("[data-test=before]");
  assert.deepEqual(await presses(page, "Tab", 2), ["header Agency", "toggle"]);
  await page.keyboard.press("Enter");
  await page.waitForSelector(list);
  await frames(page);
  return focused(page);
}

// Tabs from Menu A to the dropdown's trigger, opens the dropdown with Enter,
// and returns what has focus
async function openDropdown(page) {
  for (let pressed = 0; pressed < 10; pressed++) {
    if ((await focused(page)) === "Dropdown") break;
    await page.keyboard.press("Tab");
  }
  await page.keyboard.press("Enter");
  await page.waitForSelector(`${list} a[href="#Sub-C"]`);
  return focused(page);
}

// Waits for the menu to close, then for the focus moves that follow
async function closed(page) {
  await page.waitForSelector(list, { state: "detached" });
  await frames(page);
  return {
    focused: await focused(page),
    expanded: await page.getAttribute(toggle, "aria-expanded"),
  };
}

// Runs in the page: the focused element's size, whether it's
// `:focus-visible`, its ring (its box-shadow) and its outline
function readIndicator() {
  const element = document.activeElement;
  const { width, height } = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  return {
    sized: width > 0 && height > 0,
    focusVisible: element.matches(":focus-visible"),
    ring: style.boxShadow !== "none",
    outline:
      style.outlineStyle === "none" || parseFloat(style.outlineWidth) === 0
        ? "none"
        : `${style.outlineStyle} ${style.outlineWidth}`,
  };
}

// Where to click or tap the overlay: below the list, inside the window
async function overlayPoint(page) {
  const box = await page.locator(list).boundingBox();
  return { x: box.x + 20, y: box.y + box.height + 100 };
}

for (const [label, name] of [
  [undefined, "Menu"],
  ["Navigasi", "Navigasi"],
]) {
  test(`the menu's panel is a dialog the tree names "${name}" after the toggle${label === undefined ? "" : `, which \`aria-label="${label}"\` renames`}`, () =>
    withPage(
      async (page) => {
        assert.equal(await openWithEnter(page), "Menu A");
        assert.deepEqual(
          {
            toggle: await treeNode(page, toggle),
            panel: await treeNode(page, panel),
          },
          {
            toggle: { role: "button", name },
            panel: { role: "dialog", name },
          },
        );
      },
      { label },
    ));
}

for (const theme of themes) {
  const options = { theme };

  test(`${theme}: menu (a), Enter on the toggle focuses Menu A, which has a size and shows its focus ring`, () =>
    withPage(async (page) => {
      assert.equal(await openWithEnter(page), "Menu A");
      assert.deepEqual(await page.evaluate(readIndicator), {
        sized: true,
        focusVisible: true,
        ring: true,
        outline: "none",
      });
    }, options));

  test(`${theme}: menu (a), Tab runs Menu A → Menu B → Dropdown → toggle → Menu A, and Shift+Tab the reverse`, () =>
    withPage(async (page) => {
      await openWithEnter(page);
      assert.deepEqual(await presses(page, "Tab", 4), [
        "Menu B",
        "Dropdown",
        "toggle",
        "Menu A",
      ]);
      assert.deepEqual(await presses(page, "Shift+Tab", 4), [
        "toggle",
        "Dropdown",
        "Menu B",
        "Menu A",
      ]);
    }, options));

  test(`${theme}: menu (a), with Dropdown open, Tab from Sub C runs Sub D → toggle → Menu A, and Shift+Tab from the toggle runs Sub D → Sub C → Dropdown`, () =>
    withPage(async (page) => {
      await openWithEnter(page);
      assert.equal(await openDropdown(page), "Dropdown");
      assert.deepEqual(await presses(page, "Tab", 4), [
        "Sub C",
        "Sub D",
        "toggle",
        "Menu A",
      ]);
      assert.deepEqual(await presses(page, "Shift+Tab", 4), [
        "toggle",
        "Sub D",
        "Sub C",
        "Dropdown",
      ]);
    }, options));

  test(`${theme}: menu (b), the dropdown in the middle, Tab and Shift+Tab run through the items and the toggle, with and without the dropdown open`, () =>
    withPage(
      async (page) => {
        assert.equal(await openWithEnter(page), "Menu A");
        assert.deepEqual(await presses(page, "Tab", 4), [
          "Dropdown",
          "Menu B",
          "toggle",
          "Menu A",
        ]);
        assert.deepEqual(await presses(page, "Shift+Tab", 4), [
          "toggle",
          "Menu B",
          "Dropdown",
          "Menu A",
        ]);
        await openDropdown(page);
        assert.deepEqual(await presses(page, "Tab", 5), [
          "Sub C",
          "Sub D",
          "Menu B",
          "toggle",
          "Menu A",
        ]);
        assert.deepEqual(await presses(page, "Shift+Tab", 5), [
          "toggle",
          "Menu B",
          "Sub D",
          "Sub C",
          "Dropdown",
        ]);
      },
      { ...options, menu: "b" },
    ));

  test(`${theme}: menu (c), links only, Enter focuses the first link, Shift+Tab right after opening goes to the toggle, and Tab runs Menu A → Menu B → toggle`, () =>
    withPage(
      async (page) => {
        assert.equal(await openWithEnter(page), "Menu A");
        assert.deepEqual(await page.evaluate(readIndicator), {
          sized: true,
          focusVisible: true,
          ring: true,
          outline: "none",
        });
        assert.deepEqual(await presses(page, "Shift+Tab", 1), ["toggle"]);
        assert.deepEqual(await presses(page, "Tab", 3), [
          "Menu A",
          "Menu B",
          "toggle",
        ]);
      },
      { ...options, menu: "c" },
    ));

  test(`${theme}: menu (d), Tab runs Menu A → input → select → div → Menu B → toggle, and Shift+Tab the reverse, never reaching the link the author took out of the tab order`, () =>
    withPage(
      async (page) => {
        assert.equal(await openWithEnter(page), "Menu A");
        assert.deepEqual(await presses(page, "Tab", 6), [
          "input",
          "select",
          "div",
          "Menu B",
          "toggle",
          "Menu A",
        ]);
        assert.deepEqual(await presses(page, "Shift+Tab", 6), [
          "toggle",
          "Menu B",
          "div",
          "select",
          "input",
          "Menu A",
        ]);
      },
      { ...options, menu: "d" },
    ));

  // Each way of closing the menu, from the menu as `reach` leaves it, with
  // focus on Menu A unless it moves it. "toggle → Tab to Menu A" visits the
  // toggle with Shift+Tab and goes back.
  async function toggleAndBack(page) {
    const there = await presses(page, "Shift+Tab", 1);
    const back = await presses(page, "Tab", 1);
    assert.deepEqual([...there, ...back], ["toggle", "Menu A"]);
  }
  const closings = [
    {
      name: "Escape right after opening",
      close: (page) => page.keyboard.press("Escape"),
    },
    {
      name: "Escape after Shift+Tab to the toggle",
      async close(page) {
        await presses(page, "Shift+Tab", 1);
        await page.keyboard.press("Escape");
      },
    },
    {
      name: "Escape after toggle → Tab to Menu A",
      async close(page) {
        await toggleAndBack(page);
        await page.keyboard.press("Escape");
      },
    },
    {
      name: "a click on the overlay after toggle → Tab to Menu A",
      async close(page) {
        await toggleAndBack(page);
        const { x, y } = await overlayPoint(page);
        await page.mouse.click(x, y);
      },
    },
    {
      name: "a tap on the overlay after toggle → Tab to Menu A",
      hasTouch: true,
      async close(page) {
        await toggleAndBack(page);
        const { x, y } = await overlayPoint(page);
        await page.touchscreen.tap(x, y);
      },
    },
    {
      name: "Enter on the toggle",
      async close(page) {
        await presses(page, "Shift+Tab", 1);
        await page.keyboard.press("Enter");
      },
    },
    {
      name: "a click on the toggle",
      close: (page) => page.click(toggle),
    },
  ];

  for (const { name, close, hasTouch } of closings)
    test(`${theme}: ${name} closes the menu and leaves focus on the toggle`, () =>
      withPage(
        async (page) => {
          assert.equal(await openWithEnter(page), "Menu A");
          await close(page);
          assert.deepEqual(await closed(page), {
            focused: "toggle",
            expanded: "false",
          });
        },
        { ...options, hasTouch },
      ));

  test(`${theme}: under forced colours, Menu A draws a solid 2px outline after Enter opens the menu`, () =>
    withPage(
      async (page) => {
        assert.equal(await openWithEnter(page), "Menu A");
        const { sized, focusVisible, outline } =
          await page.evaluate(readIndicator);
        assert.deepEqual(
          { sized, focusVisible, outline },
          { sized: true, focusVisible: true, outline: "solid 2px" },
        );
      },
      { ...options, forcedColors: "active" },
    ));

  test(`${theme}: once a click outside has closed the menu, Escape and the overlay still close it back to the toggle`, () =>
    withPage(async (page) => {
      await openWithEnter(page);
      await page.click("[data-test=before]");
      assert.equal((await closed(page)).focused, "before");
      assert.equal(await openWithEnter(page), "Menu A");
      await page.keyboard.press("Escape");
      assert.deepEqual(await closed(page), {
        focused: "toggle",
        expanded: "false",
      });
      await page.click(toggle);
      await page.waitForSelector(list);
      const { x, y } = await overlayPoint(page);
      await page.mouse.click(x, y);
      assert.deepEqual(await closed(page), {
        focused: "toggle",
        expanded: "false",
      });
    }, options));

  test(`${theme}: with a dropdown open, the first Escape closes only the dropdown, and the second closes the menu and leaves focus on the toggle`, () =>
    withPage(async (page) => {
      await openWithEnter(page);
      await openDropdown(page);
      assert.deepEqual(await presses(page, "Tab", 1), ["Sub C"]);
      await page.keyboard.press("Escape");
      await page.waitForSelector(`${list} a[href="#Sub-C"]`, {
        state: "detached",
      });
      await frames(page);
      assert.equal(await focused(page), "Dropdown");
      assert.equal(await page.getAttribute(toggle, "aria-expanded"), "true");
      await page.keyboard.press("Escape");
      assert.deepEqual(await closed(page), {
        focused: "toggle",
        expanded: "false",
      });
    }, options));

  test(`${theme}: a click on the button before the Navbar closes the menu and leaves focus on that button`, () =>
    withPage(async (page) => {
      await openWithEnter(page);
      await page.click("[data-test=before]");
      assert.deepEqual(await closed(page), {
        focused: "before",
        expanded: "false",
      });
    }, options));

  test(`${theme}: a click in the list's padding leaves the menu open and focus on the item that had it`, () =>
    withPage(async (page) => {
      await openWithEnter(page);
      await presses(page, "Tab", 1);
      const box = await page.locator(list).boundingBox();
      await page.mouse.click(box.x + 4, box.y + 4);
      await frames(page);
      assert.equal(await focused(page), "Menu B");
      assert.equal(await page.getAttribute(toggle, "aria-expanded"), "true");
    }, options));

  test(`${theme}: a click on the toggle opens the menu and focuses Menu A, and the overlay closes it back to the toggle`, () =>
    withPage(async (page) => {
      await page.click(toggle);
      await page.waitForSelector(list);
      await frames(page);
      assert.equal(await focused(page), "Menu A");
      const { x, y } = await overlayPoint(page);
      await page.mouse.click(x, y);
      assert.deepEqual(await closed(page), {
        focused: "toggle",
        expanded: "false",
      });
    }, options));

  test(`${theme}: a Dialog opened from a button in the menu keeps Tab and Shift+Tab inside it, and Escape closes only the Dialog`, () =>
    withPage(
      async (page) => {
        await openWithEnter(page);
        assert.deepEqual(await presses(page, "Tab", 1), ["open-dialog"]);
        await page.keyboard.press("Enter");
        await page.waitForSelector("[data-test=dialog][data-state=open]");
        await frames(page);
        const inDialog = (seen) =>
          seen.filter((name) => !name.startsWith("dialog "));
        const tabbed = await presses(page, "Tab", 4);
        const shiftTabbed = await presses(page, "Shift+Tab", 4);
        assert.deepEqual(
          { tabbed: inDialog(tabbed), shiftTabbed: inDialog(shiftTabbed) },
          { tabbed: [], shiftTabbed: [] },
        );
        // Tab cycles through the Dialog's buttons: its two, and the close
        // cross
        assert.equal(new Set(tabbed).size, 3);
        await page.keyboard.press("Escape");
        await page.waitForSelector("[data-test=dialog]", { state: "detached" });
        await frames(page);
        assert.equal(await page.getAttribute(toggle, "aria-expanded"), "true");
      },
      { ...options, menu: "dialog" },
    ));

  test(`${theme}: from xl: up, Tab and Shift+Tab run through the desktop menu in DOM order, and the toggle is hidden`, () =>
    withPage(
      async (page) => {
        assert.equal(await page.isVisible(toggle), false);
        await page.focus("[data-test=before]");
        assert.deepEqual(await presses(page, "Tab", 5), [
          "header Agency",
          "header Menu A",
          "header Menu B",
          "header Dropdown",
          "after-1",
        ]);
        assert.deepEqual(await presses(page, "Shift+Tab", 5), [
          "header Dropdown",
          "header Menu B",
          "header Menu A",
          "header Agency",
          "before",
        ]);
      },
      { ...options, viewport: desktop },
    ));
}
