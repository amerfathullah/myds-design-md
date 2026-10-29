---
"@govtechmy/myds-react": patch
---

`require("@govtechmy/myds-react/hooks")` resolves again: the `./hooks` export pointed CommonJS at `dist/hooks/index.j` in place of `dist/hooks/index.js`.
