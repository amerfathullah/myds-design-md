# The component library doesn't hand national marks to authors

The component library shows the Malaysia flag itself, in the Masthead, and stops giving authors either national mark to place (#96). Both marks came from upstream as ordinary exports of the icon entry (`@amerfathullah/myds-react/icon`), next to 218 other icons, and the docs icon gallery offered both for copying. A national mark tells citizens that the Government runs a site, so only an official service may show one, and an entry that offers it like any other icon invites every other site to show it too. So both are deprecated on the icon entry in 2.x and removed from it at the next major. The flag then stays private to the Masthead, and the Jata Negara, which no library component uses, is deleted.

## Considered Options

- **Keep both as ordinary icons and rely on the written rule**: rejected. The rule would live only in DESIGN.md and CONTEXT.md, while the icon entry and the gallery present the marks as just more icons.
- **Move both to a separate national-mark entry that states the rule**: rejected. It's still a public way for any site to place a mark, and it's one more entry to maintain.
- **Remove both from the icon entry now**: rejected. Removing an export is a breaking change, and doing it now would force a major release for this alone. Deprecating first gives consumers notice, and the removal ships with the next major.

## Consequences

- This doesn't prevent misuse:
  - The Masthead still shows the flag for whoever renders it.
  - The flag's SVG stays in this public repository, and the Jata Negara's stays in its history.
  - Every published 2.x release keeps exporting both. So does upstream's `@govtechmy/myds-react` 1.x, which can't be deprecated from here (ADR-0005).

  As ADR-0001 says, the real limit is Malaysian law. What changes is what MYDS offers: the library and its docs stop presenting the marks as icons to drop into any UI.
- An official service that shows the Jata Negara supplies the image itself, through the Navbar or Footer logo slot, as it supplies its agency logo. The docs' Footer examples already do this.
- The icon generator rebuilds the icon entry from the icon sources, so the marks' sources must sit outside them, or a regeneration would put the marks back.
- At the next major the icon entry loses two names, and DESIGN.md's icon counts change with it.
