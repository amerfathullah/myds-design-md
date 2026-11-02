---
"@amerfathullah/myds-style": patch
---

The preset now clears Tailwind's `drop-shadow-*` and `text-shadow-*` scales, as it already cleared `shadow-*` and `inset-shadow-*`. Their steps no longer generate any CSS: bare `drop-shadow`, `drop-shadow-xs` … `drop-shadow-2xl` and `text-shadow-2xs` … `text-shadow-lg`. They gave Tailwind's own shadows, which aren't part of MYDS's shadow scale.

**If you use them in your own markup, that element loses its shadow.** Use `shadow-button`, `shadow-card` or `shadow-context-menu` instead.

`drop-shadow-none`, `text-shadow-none`, colour modifiers such as `drop-shadow-primary-600`, and arbitrary values such as `drop-shadow-[0_1px_2px_black]` still work. No MYDS component used these utilities, so components look the same.
