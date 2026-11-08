/**
 * Finds an icon in rendered markup by what it draws, for tests that need to
 * tell one icon from another, such as a dialog's close cross from its status
 * icon. Icons render no id a test could select them by (#153), and a test
 * mustn't add an attribute to their output to find them.
 *
 * Shared by the component tests. It sits outside the icon directory, which the
 * icon generator rewrites, and no entry imports it, so the build leaves it out.
 */
import { createElement, type FunctionComponent, type SVGProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";

type Icon = FunctionComponent<SVGProps<SVGSVGElement>>;

/**
 * The markup with every id blanked, where it's defined and where `url(#…)` or
 * `href="#…"` refers to it. An icon with a clip path, mask or gradient gives
 * each copy its own ids from `useId()`, so two copies differ only there.
 */
export function withoutIds(markup: string): string {
  return markup
    .replace(/(\sid=")[^"]*"/g, '$1"')
    .replace(/url\(#[^)]*\)/g, "url(#)")
    .replace(/(\s(?:xlink:)?href="#)[^"]*"/g, '$1"');
}

/**
 * What an icon draws: the markup inside its root `<svg>`, from the markup of
 * the whole icon, its ids blanked. The root's own attributes, such as the
 * `className` a component gives the icon, are left out.
 */
export function iconBody(svgMarkup: string): string {
  // The root's opening tag, read past quoted values, since a class such as
  // `[&>path]:hidden` can hold a `>`
  const root = /^\s*<svg(?:[^>"']|"[^"]*"|'[^']*')*>/.exec(svgMarkup);
  if (!root) throw new Error(`Not an icon's markup: ${svgMarkup}`);
  return withoutIds(
    svgMarkup.slice(root[0].length, svgMarkup.lastIndexOf("</svg>")),
  );
}

/** What `icon` draws, rendered on its own */
export function renderedBody(icon: Icon): string {
  return iconBody(renderToStaticMarkup(createElement(icon)));
}

/** Whether `svg`, on the page, is a copy of `icon` */
export function isIcon(svg: Element, icon: Icon): boolean {
  return iconBody(svg.outerHTML) === renderedBody(icon);
}
