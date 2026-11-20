---
"@amerfathullah/myds-react": patch
---

The calendar in `DatePicker` and `DateRangePicker` now picks the month or year you click in its month and year views, and its year view lists exactly `minYear` to `maxYear`.

- **Month view on the 29th to the 31st.** A month cell now picks a date in its own month, with the selected day cut to that month's length. With 30 October 2026 selected, the cells read "Jan, Feb, Mar…", February picks 28 February 2026 and the day view opens on February. With 31 October, November picks 30 November. Before, the day carried over and a shorter month rolled into the next one. The cells read "Jan, Mar, Mar, Apr…", and February's cell picked 2 March 2026. With 31 October, February, April, June, September and November were missing. With nothing selected, the same happened whenever today was the 29th to the 31st. A `disabled` matcher checked the rolled-over date, so disabling every day of March disabled two cells, and disabling every day of February disabled none.
- **The year view lists `minYear` to `maxYear`.** It counts down with `yearOrder="desc"`, in rows of three with the short row last. Before, it showed one year too many or one too few:
  - 1900 to 2100 by default, so 2100 could be picked.
  - 2020 to 2031 with `minYear={2020} maxYear={2030}`.
  - 2000 to 2002 with `minYear={2000} maxYear={2003}`.
  - No years when `minYear` equalled `maxYear`.
  - A `minYear` 3 or more above `maxYear` threw a `RangeError`. Now a `minYear` above `maxYear` shows no years.
- **29 February in the year view.** With 29 February 2024 selected, picking 2025 now picks 28 February 2025, and the month view fills Feb. Before, it picked 1 March 2025 and filled Mar.
- **Picking a year leaves your Dates alone.** It no longer changes the Date you passed as DatePicker's `value` or `defaultValue`, or as DateRangePicker's `from` or `to`, or a Date that `onValueChange` received from a month pick in the same calendar. Before, with `value` 15 October 2026, picking 2030 changed that Date to 15 October 2030, even when `onValueChange` ignored the change. A range whose `from` and `to` were the same Date moved both ends.

The props and their types don't change.

**If you upgrade:**

- The year view no longer offers `maxYear + 1`, which is 2100 by default. If your users need that year, raise `maxYear`, for example `maxYear={2100}`.
- Picking a year no longer changes the Date passed as `value`, `from` or `to`. Read the picked date from `onValueChange`, not from the Date you passed in.
