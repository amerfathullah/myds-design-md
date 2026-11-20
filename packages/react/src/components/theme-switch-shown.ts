/**
 * Reads what a ThemeSwitch shows, for its tests: the toggle's accessible name
 * and content, and the select trigger's name and value area. Shared by the
 * server HTML tests and the browser tests. No entry imports it, so the build
 * leaves it out.
 */
import { DesktopIcon, MoonIcon, SunIcon } from "../icons";
import { isIcon } from "../svg/icon-test-markup";

/** The icons a ThemeSwitch draws, by the name each test expects */
const themeIcons = { sun: SunIcon, moon: MoonIcon, desktop: DesktopIcon };

/**
 * What `element` shows: its text, and each icon it draws, by name, with the
 * classes on the icon's `<svg>`
 */
function contentOf(element: Element) {
  return {
    text: element.textContent,
    icons: [...element.querySelectorAll("svg")].map((svg) => ({
      icon:
        Object.entries(themeIcons)
          .filter(([, icon]) => isIcon(svg, icon))
          .map(([name]) => name)
          .join() || "other",
      classes: svg.getAttribute("class"),
    })),
  };
}

/** The toggle's accessible name and what it shows */
export function toggleShows(container: ParentNode) {
  const button = container.querySelector('button:not([role="combobox"])');
  if (!button) throw new Error("There is no toggle");
  return { name: button.getAttribute("aria-label"), ...contentOf(button) };
}

/**
 * The select trigger's accessible name, and what its value area shows. The
 * value area is the trigger's first child; the chevron after it isn't part
 * of it.
 */
export function selectShows(container: ParentNode) {
  const trigger = container.querySelector('[role="combobox"]');
  const value = trigger?.firstElementChild;
  if (!trigger || !value) throw new Error("There is no select trigger");
  return { name: trigger.getAttribute("aria-label"), ...contentOf(value) };
}
