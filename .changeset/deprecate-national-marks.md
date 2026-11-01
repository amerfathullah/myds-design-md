---
"@amerfathullah/myds-react": minor
---

`MalaysiaFlagIcon` and `JataNegaraIcon` are deprecated on `@amerfathullah/myds-react/icon`, and the next major removes them from it. Both are national marks, not icons. A national mark tells citizens that the Government runs a site, so only an official service may show one, and an icon entry that offers both next to 218 other icons invites any site to show them. Nothing breaks: the entry still exports both, as the same components with the same type, and they render the same SVG. Editors and the `@typescript-eslint/no-deprecated` rule now flag each import, with a note saying what to use instead. The Masthead already shows the flag. An official service that shows the Jata Negara supplies the image itself, through the Navbar or Footer logo slot, as it supplies its agency logo. The Masthead renders as before, and no other entry exports either mark.
