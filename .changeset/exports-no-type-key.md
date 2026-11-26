---
"@amerfathullah/myds-react": patch
---

Each subpath in the package's `exports` map no longer has a `type` key (#234). No tool read it by default: TypeScript's condition is `types`, not `type`, and Node, bundlers and TypeScript skip conditions they don't recognise. Each entry now has only `import` and `require`, pointing at the same files as before.

Nothing changes for you. Every subpath resolves to the same JavaScript, and TypeScript still finds each condition's declarations beside the file that condition resolves to: the `.d.mts` for `import` and the `.d.ts` for `require`. The one exception is a build that opts into a custom condition named `type`, such as TypeScript's `customConditions: ["type"]`. Its ESM imports now get the `.d.mts` declarations, which match the ESM they load, where before they got the CommonJS `.d.ts`.
