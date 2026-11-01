# National marks aren't handed to authors as icons

The component library places the Malaysia flag itself, in the Masthead, and doesn't give authors either **national mark** to place. Both marks came over in the upstream snapshot as ordinary exports of the generic icon entry, next to 218 icons any site may use, and the docs icon gallery offered both for copying. A national mark tells citizens that the Government runs a site, so only an **official service** may show one, and an entry that offers it like any other glyph invites every other site to show it too. So both are deprecated on the icon entry in 2.x and removed from it at the next major. The flag stays private to the Masthead, and the Jata Negara, which no component uses, is deleted. (#96)

## Considered Options

- **Keep both as ordinary icons and rely on the written rule**: rejected. The rule would live only in DESIGN.md, while the icon entry and the gallery present the marks as just more icons.
- **Move both to a separate national-mark entry that states the rule**: rejected. It's still a public way for any site to place a mark, and it's one more entry to maintain.
- **Remove both from the icon entry now**: rejected. Removing an export is a breaking change, and doing it now would force a major release for this alone. Deprecating first gives consumers notice, and the removal ships with the next major.

## Consequences

- This doesn't prevent misuse. The Masthead still shows the flag for whoever renders it, and the SVGs stay public in this repository. As ADR-0001 says, the real limit is Malaysian law. What changes is what MYDS offers: the library and its docs stop presenting the marks as icons to drop into any UI.
- An official service whose agency logo is the Jata Negara supplies it through the Navbar and Footer logo slots, as it would any agency logo. The docs' Footer examples already do this with an image.
- The icon generator rebuilds the icon entry from the icon sources, so the marks' sources must sit outside them, or a regeneration would put the marks back.
- At the next major the icon entry loses two names, and DESIGN.md's icon counts change with it.
