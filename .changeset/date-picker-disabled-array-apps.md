---
"@govtechmy/myds-docs": patch
"@govtechmy/myds-storybook": patch
---

The docs' DatePicker and DateRangePicker pages (EN/MS) now say that `true` inside a `disabled` array disables the whole picker, as `true` does, so `disabled={[isLocked, { before: new Date() }]}` disables it while `isLocked` is `true`. They also say that a rule that happens to match every day, such as `() => true`, disables only the days and leaves the picker focusable, and that `disabled={isLocked ? true : rule}` or a disabled `<fieldset>` disables the whole picker whatever the rule. The `disabled` row of each props table, and both pickers' `disabled` descriptions in Storybook, state the same rule.
