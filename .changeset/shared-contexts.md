---
"@amerfathullah/myds-react": patch
---

Every entry now shares one of each context and one toast emitter when you load the library through `require`, and when you load some entries through `import` and others through `require` (#119, #235). Before, each CommonJS entry carried its own copy of each, so a provider from one entry never reached a component from another, and nothing was logged. This hit Jest without ESM mode, plain Node `require`, CommonJS server bundles that leave the package to Node, and the Next pages router with `esmExternals: false`. Loading only through `import`, as Next's default, Vite and Vitest do, already worked. Under `require`, or mixing the two:

- **Theme.** ThemeSwitch inside a ThemeProvider, or inside your own `ThemeContext.Provider` as the docs' ThemeBridge does, now shows and sets the provider's theme. It showed Light, and clicking the toggle changed nothing.
- **Toasts.** `toast()` from `useToast` now shows in a mounted `AutoToast`. Nothing showed.
- **Dialogs.** A `DialogClose` inside `AlertDialogContent`, or an `AlertDialogClose` inside `DialogBody`, now calls the dialog's `onDismiss`. The dialog closed, but `onDismiss` was never called.
- **Buttons.** `ButtonIcon` and `ButtonCounter` inside `PaginationPrevious`, `PaginationNext`, `CookieBannerPreferencesTrigger` and `Skiplink` now take that button's size and variant, not the small `primary-fill` default.

The library keeps its contexts and its emitter on `globalThis`, under a key for this package's major version, once for each copy of React. Separate copies of React, such as two independently bundled apps on one page, still share nothing, and neither do different major versions of the library. Where `globalThis` is frozen, each entry keeps its own copies, as before. The build's files, exports and types are unchanged.

**What else changes:**

- With one shared React and two bundled copies of the library, as in module federation or single-spa, each `toast()` shows in every mounted `AutoToast`. Mount one per page.
- Copies of the same major version share each context's default value, and the copy that loads first decides it.
- A module evaluated again gets back the context it made before. So in development, a context default you edit in the library stays as it was until a full reload, or until you restart `next dev`.
- In Vitest, with the library inlined, `vi.resetModules()` no longer gives fresh contexts. That now matches an installed copy.
