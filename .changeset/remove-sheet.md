---
"@amerfathullah/myds-react": patch
"@amerfathullah/myds-style": patch
---

The unexported Sheet component is removed from `@amerfathullah/myds-react`. Its compiled files shipped in the package, but its `exports` map never had a `./sheet` entry, so `@amerfathullah/myds-react/sheet` could never be imported and no component used it. Nothing public changes: every subpath the package exports resolves as before, and its dependencies are the same. `full.css` in `@amerfathullah/myds-style` no longer carries the classes that only Sheet used.
