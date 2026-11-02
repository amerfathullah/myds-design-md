---
"@amerfathullah/myds-react": minor
"@govtechmy/myds-docs": patch
---

The calendar in `DatePicker` and `DateRangePicker` now names its controls in the picker's `locale`, and you can rename the month view's year buttons in your site's language.

- **Malay names under `locale="ms"`:** the calendar takes its names from react-day-picker's own `ms` locale. Screen readers announce the `<nav>` as "Bar navigasi", the day view's buttons as "Pergi ke bulan sebelumnya" / "Pergi ke bulan seterusnya", the grid as "Oktober 2026", the weekday headings in full ("Ahad" … "Sabtu"), and the day buttons like "Jumaat, 30 Oktober 2026, dipilih". Before, they were English inside an element marked `lang="ms"`.
- **New `previousYearLabel` and `nextYearLabel` props** on both pickers, defaulting to "Go to the Previous Year" and "Go to the Next Year". They name the month view's year buttons, which no locale names, in every calendar the picker renders. For example, `previousYearLabel="Pergi ke tahun sebelumnya"` and `nextYearLabel="Pergi ke tahun seterusnya"`. They never reach the DOM.
- **Named month and year grids:** the month view's grid is "Pilih bulan" / "Choose the Month", and the year view's grid "Pilih tahun" / "Choose the Year". They had no name. Opening either view no longer logs React's missing-key warning.
- **New wording of English day buttons:** under `locale="en"` the calendar uses react-day-picker's `enGB` names, so day buttons read "Friday, 30 October 2026, selected" instead of "Friday, October 30th, 2026, selected". Its other English names are unchanged.

Nothing changes visually: the same elements, classes and text render, the week still starts on Sunday, and the triggers read as before.

The docs (EN/MS) say the calendar's names follow `locale`, and document `previousYearLabel` and `nextYearLabel`.
