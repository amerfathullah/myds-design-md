---
"@amerfathullah/myds-react": major
"@govtechmy/myds-docs": patch
---

`Footer` no longer breaks landmark and heading rules: it nests no complementary landmark, each link group is a navigation landmark named after its title, and a string group title is no longer a heading. The footer looks the same. `SiteInfo` and `SiteLinkGroup` render different elements, and their prop types change with them:

- `SiteInfo` renders a `<div>` in place of an `<aside>`. Its props are `div` props, so its ref is an `HTMLDivElement`: a `RefObject<HTMLElement>` no longer type-checks. Update CSS or tests that select the `aside`.
- `SiteLinkGroup` renders one `<nav>` holding the title and the links, in place of a `<div>` wrapping the title and a `<nav>`. Its props are `nav` props, so its ref is an `HTMLElement`. Props, `className` and `ref` apply to the `<nav>` only; they used to land on both elements, which duplicated an `id` or `aria-label`. `className` no longer reaches the grid that lays out the links.
- A string `groupTitle` renders as text (a `<div>`) in place of an `<h6>`, and names the group's `<nav>` through `aria-labelledby`, unless you pass an `aria-label`. Give each group a distinct title, so each navigation landmark has a unique name. To keep a heading, pass your own element as `groupTitle` and name the navigation yourself, e.g. `groupTitle={<h2 id="services-title">Services</h2>}` with `aria-labelledby="services-title"`.

The docs Footer page (EN/MS) describes the new elements and gives each example link group its own title.
