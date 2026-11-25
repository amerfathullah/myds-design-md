---
"@govtechmy/myds-docs": patch
---

The docs now show how to make the Masthead a page region named by its title, and the docs site's own Masthead is one. The Masthead renders a plain `<div id="masthead">`, so in the page frame its title and explainer sat outside every landmark: screen reader users who move by landmark skipped them, and an axe run over a whole page reported them under its `region` rule.

- **The develop docs (EN/MS).** The Masthead page's example, in its preview and its code, passes `role="region"` to `Masthead` and points its `aria-labelledby` at `MastheadTitle`'s `id`. A note says why and shows the pattern, with "Portal Rasmi Kerajaan Malaysia" on the Malay page. It says to always name the region, because browsers don't expose a region with no name as a landmark, and not to name the Masthead without the role. Masthead's props list `role`, `aria-labelledby` and `aria-label`, and MastheadTitle's list `id`.
- **The docs site.** Its shared Masthead, on the home, community, icon and not-found pages, is a region named by its translated title.

`@amerfathullah/myds-react` doesn't change: `Masthead` already passes `role` and `aria-labelledby` to its `<div id="masthead">`, and `MastheadTitle` passes `id` to its `<p>`.
