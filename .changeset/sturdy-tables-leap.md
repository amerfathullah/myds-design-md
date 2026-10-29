---
"@govtechmy/myds-react": major
---

Move to TanStack Table 9 (`@tanstack/react-table` 9.3) and react-day-picker 10, with every other dependency on its latest stable release except `tailwind-merge`, which moves to 3 with the Tailwind 4 preset. React and React DOM 18 and 19 stay supported (`^18.0.0 || ^19.0.0`). `DataTable`, `DatePicker` and `DateRangePicker` keep their props, look and behaviour.

**`DataTable` column definitions**

- `ColumnDef` from `@govtechmy/myds-react/data-table` keeps its name and its `<TData, TValue>` type parameters, so `ColumnDef<Employee>[]` still compiles. It is now TanStack Table 9's `ColumnDef` for the features `DataTable` registers.
- Rename `sortingFn` to `sortFn`. TypeScript doesn't flag the old key, and `DataTable` ignores it.
- Where you name TanStack types yourself, import them from `@tanstack/react-table` 9 and pass the new `DataTableFeatures` type (exported from `@govtechmy/myds-react/data-table`) first: `Row<Employee>` becomes `Row<DataTableFeatures, Employee>`, `CellContext<Employee, unknown>` becomes `CellContext<DataTableFeatures, Employee, unknown>`, and `createColumnHelper<Employee>()` becomes `createColumnHelper<DataTableFeatures, Employee>()`. Wrap a column helper's columns in `helper.columns([...])` to pass them to `columns`.
- `meta` (`className`, `sortable`, `expandable`, `tooltip`) is typed on `DataTable` columns only: `DataTable` no longer augments TanStack's global `ColumnMeta`.
- The `table`, `column`, `row` and `cell` objects that `header`, `cell` and `footer` receive only have the APIs of the features `DataTable` uses: sorting, row selection, expanding, column pinning, sizing, visibility, ordering and faceting, plus `table.getRowCount()`. The column filtering, grouping, row pinning and column resizing APIs are gone: `DataTable` never applied them. Read state with `table.store.state` in place of `table.getState()`.
- `column.getIsPinned()` returns `"start"` or `"end"` in place of `"left"` or `"right"`. The `pin={{ left, right }}` prop and the `data-pinned="left" | "right"` attribute don't change.
- `table.getIsSomeRowsSelected()` is also `true` when every row is selected. Check `!table.getIsAllRowsSelected()` as well for an indeterminate state.

**`DatePicker` and `DateRangePicker`**

No prop changes. `Matcher` (the `disabled` prop) and `DateRange` (re-exported from `@govtechmy/myds-react/daterange-picker`) are react-day-picker 10's types, with the same shape. `CalendarProps` stays internal: `Calendar` isn't an entry point. The calendar now sets `lang` from `locale` (`en-GB` or `ms`) and labels its navigation "Navigation bar". In the day grid, Shift with the left/right arrows moves by a month and with the up/down arrows by a year. A day that becomes disabled while focused keeps focus and is marked `aria-disabled`, styled like other disabled days.

**`Select`**

`SelectItem` renders its text inside Radix's `ItemText`, which Radix Slot 1.5 requires (it throws on the old markup). The item text gains a `<span>` wrapper, each option's `aria-labelledby` now resolves to that text, and typing a letter moves to the matching option.
