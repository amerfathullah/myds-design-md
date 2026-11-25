---
"@amerfathullah/myds-react": patch
---

Every icon on `@amerfathullah/myds-react/icon` now forwards its ref to its `<svg>`, so a ref on an icon works on React 18. That includes a ref a component attaches to an icon you give it as its child, such as `ButtonIcon`'s, `InputIcon`'s, `DropdownItemIcon`'s and `DialogIcon`'s, and a Radix trigger's with `asChild`: `<TooltipTrigger asChild><InfoIcon /></TooltipTrigger>` now anchors its tooltip to the icon, not off the top-left corner of the page. Before, React 18 dropped the ref: an object ref stayed `null` and a callback ref was never called. In development React warned "Function components cannot be given refs"; in production it said nothing. React 19 already passed the ref on, and still does. The deprecated `JataNegaraIcon` and `MalaysiaFlagIcon` forward theirs too.

- **Importing one icon still bundles only that icon.** Each icon is now a `forwardRef` component, named after its export in React's developer tools. Your bundler still drops the icons you don't import, from the icon entry and from the component entries that use an icon. For that, the package's built files are no longer minified for whitespace, which would strip the `/* @__PURE__ */` marks your bundler reads. Its ES modules are about 1.3 MB to install, up from 1.0 MB. Your app's own build minifies them as before, so an app that imports every entry grows by about 4 kB gzipped, the cost of the icons' wrappers.
- **Render icons as elements.** `<ChevronDownIcon />` and `createElement(ChevronDownIcon)` work as before. Calling an icon as a function, `ChevronDownIcon(props)`, still type-checks, but it now throws a `TypeError`.

Nothing else changes. Each icon renders the same markup, and takes the same props. Its type is now `ForwardRefExoticComponent<SVGProps<SVGSVGElement>>`, and code that assigns it to `FunctionComponent<SVGProps<SVGSVGElement>>` still compiles. The deprecated national marks keep that old type.
