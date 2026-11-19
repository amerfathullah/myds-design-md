---
"@amerfathullah/myds-react": minor
"@govtechmy/myds-docs": patch
---

Screen readers now announce what the date pickers' calendars and the Navbar's mobile menu are for. The dialogs they open in had no name, and axe flagged each one (`aria-dialog-name`). DateRangePicker's From and To dialogs couldn't be told apart.

- **New `calendarLabel` prop** on `DatePicker`, defaulting to "Choose date". It names the dialog the calendar opens in: the Dialog below `lg:` and the Popover from `lg:` up. Screen readers announce it; it isn't shown. Set it in your site's language, for example `calendarLabel="Pilih tarikh"`.
- **New `fromCalendarLabel` and `toCalendarLabel` props** on `DateRangePicker`, defaulting to "Choose start date" and "Choose end date". `fromCalendarLabel` names the From calendar's Dialog and Popover, and `toCalendarLabel` the To calendar's. For example, `fromCalendarLabel="Pilih tarikh mula"` and `toCalendarLabel="Pilih tarikh akhir"`. `fromLabel` / `toLabel` still change only the triggers' "From:" / "To:" prefixes, not these names.
- **The new props don't follow `locale`.** Under `locale="ms"` the dialogs are named "Choose date", "Choose start date" and "Choose end date" until you pass Malay text, as the year buttons are named "Go to the Previous Year" / "Go to the Next Year" until you pass `previousYearLabel` / `nextYearLabel`.
- **The pickers' `aria-label`, `aria-labelledby` and `aria-describedby` are unchanged.** They still reach every trigger and nothing in an open calendar or dialog, so a dialog isn't named after its picker's label. The triggers still have no default name.
- **Why the dialogs have a default.** ADR-0011 rejected "Choose date" as a default for the triggers: a trigger shows its date, which a default `aria-label` would replace, and a default would hide a picker you forgot to label. Neither reason applies to a dialog with no visible title, so the dialogs get English defaults you can replace, as other built-in names do (ADR-0008).
- **The Navbar's mobile menu is named after its toggle.** Below `xl:`, NavbarAction's toggle opens the menu in a panel that screen readers announce as a dialog. The panel now takes its name from the toggle, so it is "Menu" by default, and an `aria-label` or `aria-labelledby` on NavbarAction renames the toggle and the panel at once, for example `aria-label="Navigasi"`. There is no new prop. If the panel can't find the toggle, as when the Navbar's context comes from an older copy of the library, it is still named "Menu".
  - The toggle keeps its name, `aria-expanded` and `aria-controls`, and NavbarMenu's `aria-label` / `aria-labelledby` still name only its `<nav>` ("Main"). Focus and the Tab order in the menu don't change.
  - The toggle now always has an `id`. It is generated, and an `id` you pass to NavbarAction replaces it. In the server-rendered HTML, this change only adds that `id`.

Nothing changes visually.

The docs (EN/MS) document `calendarLabel`, `fromCalendarLabel` and `toCalendarLabel` and say that they don't follow `locale`, say that the pickers' triggers have no default name, and give the name of the Navbar's mobile menu panel and how NavbarAction's `aria-label` or `aria-labelledby` renames it.
