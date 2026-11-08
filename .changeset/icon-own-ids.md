---
"@amerfathullah/myds-react": patch
---

Each copy of an icon with a clip path, mask or gradient now gets its own ids, so hiding one copy no longer breaks another. Before, every copy of such an icon carried the same ids, and the browser resolved each copy's `url(#…)` to the first copy. A later copy then rendered blank while an earlier one was under `visibility: hidden` (Tailwind's `invisible`), or drew wrong while an earlier one was under `display: none` (`hidden`, a closed `<details>`). This affected 46 icons on `@amerfathullah/myds-react/icon`, such as `FacebookIcon`, `SunIcon`, the agency marks, `MiniInternetMCMCIcon` and the four `…MediaIcon`s. The deprecated `MalaysiaFlagIcon`, which the Masthead also shows, no longer has any id that its copies share, and it draws the same as before. The deprecated `JataNegaraIcon` still shares its ids until the next major removes it.

- The ids come from React's `useId()`, so don't rely on their format. Ids that nothing refers to, such as `Icon/cross`, are unchanged.
- Snapshot tests that include these icons will see their ids change.
- A page that server-renders and hydrates several separate React roots, such as islands, should give each root its own `identifierPrefix` (in `hydrateRoot` and the matching server render), or copies in different roots can still share ids.
