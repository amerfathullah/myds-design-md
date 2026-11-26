---
"@amerfathullah/myds-react": patch
---

The package no longer ships Calendar and Popover as entries of their own (#236). The build wrote 12 files for them, `dist/components/calendar.*` and `dist/components/popover.*`: CommonJS and ESM scripts, declarations and sourcemaps. These files were never in the `exports` map, so `@amerfathullah/myds-react/calendar` and `/popover` could never be imported, and Node and current bundlers refuse the deep paths. Both stay internal to DatePicker and DateRangePicker, which carry their code as before.

Every subpath is unchanged: it resolves to the same files, with the same exports, types and behaviour.

**What changes:**

- Resolvers that ignore `exports`, such as TypeScript's `moduleResolution: "node10"`, webpack 4 and Jest before 28, could load `dist/components/calendar` and `dist/components/popover` by their deep paths. They can't any more.
- The tarball holds 16 fewer files: those 12, and 4 chunk files, because the three ESM chunks that only the pickers share are now one. That makes it about 21 kB smaller packed and 91 kB smaller unpacked. The saving is in what you download and install, not in your app's bundle, which keeps the same code in a different module order.
