---
"@amerfathullah/myds-react": patch
---

`require("@amerfathullah/myds-react/hooks")` resolves again: the `./hooks` export pointed CommonJS at `dist/hooks/index.j` in place of `dist/hooks/index.js`.
