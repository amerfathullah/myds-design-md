---
"@govtechmy/myds-storybook": patch
---

The LandingPage example story now renders the whole page frame: `Skiplink` first, then the Masthead and the Navbar, then the content `<section>` inside `<main id="main-content" tabIndex={-1}>`, then the Footer. Before, it had no skip link and no `<main>`, so keyboard users Tabbed through the Masthead and the Navbar to reach the content, and screen reader users had no main landmark to jump to. Now the first Tab focuses "Skip to main content", Enter moves focus to the `<main>`, and the next Tab reaches the content's button. A `play` test on the Mobile, Tablet and Desktop stories checks this.
