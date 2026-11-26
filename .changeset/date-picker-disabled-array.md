---
"@amerfathullah/myds-react": minor
---

`DatePicker` and `DateRangePicker` now disable the whole picker when `disabled` is an array that contains `true`, as they do for `true`. react-day-picker reads an array of Matchers as "any of these", so a `true` in it disabled every day, but only `disabled={true}` disabled the triggers. With `disabled={[isLocked, { before: today }]}` and `isLocked` on, every trigger looked enabled, took Tab focus, was announced as an operable button, and opened a calendar in which nothing could be picked: below `lg:`, a dialog with no close button.

- **`true`, alone or as an element of an array, wherever it stands, disables the whole picker.** `[true]`, `[true, { before: date }]` and `[{ dayOfWeek: [0, 6] }, true]` now behave as `true` does. Every trigger the picker renders takes native `disabled` and the `default-outline` Button's disabled look, Tab skips it, and a click, Enter or Space opens nothing. DateRangePicker's `From:` / `To:` prefix dims, as it does for `true`. A disabled trigger keeps its text, its accessible name and its description, and the calendars disable the same days as before.
- **Booleans elsewhere don't count.** A `false` in an array changes nothing, so `[false, { before: date }]` behaves as `{ before: date }`, and `[false]` and `[]` disable nothing.
- **Any other value still disables only days, even every day.** A function such as `() => true`, a `{ before }`, `{ after }` or `{ from, to }` that covers `minYear` to `maxYear`, all seven `dayOfWeek` values, a list of Dates, and DateRangePicker's own From/To bound combined with a day rule leave the triggers enabled. The picker doesn't try to detect them. To disable the whole picker whatever the rule, pass `true` itself, as in `disabled={isLocked ? true : rule}`, or put the picker in a disabled `<fieldset>`.

`disabled` keeps its type, `Matcher | Matcher[]`, and its JSDoc on both pickers states the rule. Nothing changes for `true` or for a single non-boolean Matcher.

**If you upgrade:**

- An array that contains `true` now disables the triggers: they leave the Tab order, are announced as disabled, and open nothing.
- To keep a picker focusable while no day can be picked, pass a rule without `true`, such as `() => true`.
