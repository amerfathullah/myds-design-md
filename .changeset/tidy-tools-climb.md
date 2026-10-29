---
"@govtechmy/myds-react": patch
---

Rebuild with the upgraded toolchain (TypeScript 6, tsup 9). The published JavaScript and type declarations are regenerated: minified names and the order of statements in the `.d.ts` files change (type-only exports are now emitted as `export type { … }`), with no change to the public API.
