---
"@amerfathullah/myds-react": patch
---

Icons no longer render the layer ids from their Figma sources, such as `Vector`, `Vector 146` or `Icon/cross`, so components stop repeating ids on a page. Nothing referred to these ids, but every copy of an icon carried them. So each of these repeated an id on its own: a checked Checkbox, AutoPagination, a Callout with a close button, an Accordion with two items, a Breadcrumb with two separators, an AlertDialog or a Toast with a status variant, and ThemeSwitch with `as="select"`. Two Selects on one page did too. An app's own id that matched a layer name, such as `<h2 id="Vector">`, resolved to an icon instead. That could leave a section named by `aria-labelledby` with no name, or send a `#Vector` link to the wrong place.

- **Which icons.** 214 of the icons on `@amerfathullah/myds-react/icon` drop these ids. So does the deprecated `MalaysiaFlagIcon`, the same flag the Masthead shows. They all draw the same as before. An icon still renders the ids its clip paths, masks and gradients need, each copy with its own. The deprecated `JataNegaraIcon` is unchanged until the next major removes it.
- **Snapshots.** Snapshot tests that include these icons will see the ids go.

**If you upgrade:** a selector, stylesheet or test that matched one of these ids now matches nothing. That includes `[id="Icon/cross"]`, `#Vector`, and the legacy icons' group ids, such as `agency-icons/mini/dosm` or `agency-icons/miniidentity-jpn`. Hook it to something else, such as the button around the icon, or your own `className` or `data-` attribute on the icon, which an icon passes to its `<svg>`.
