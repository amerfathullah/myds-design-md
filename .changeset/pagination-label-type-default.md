---
"@amerfathullah/myds-react": minor
---

`PaginationLabel` is now exported from `@amerfathullah/myds-react/pagination`, at runtime and in the declarations, as the Pagination docs already document it. Its rendering is unchanged: inside a `Pagination` it shows `content` when given, and otherwise "Page {page} of {totalPages}" when `type` is `full` and nothing for `default` or `simple`. Its `content` prop takes any React node. The entry point's other exports are unchanged.

`type` is now optional on `Pagination` and `AutoPagination`, and defaults to `default`, as their docs say. `<Pagination>`, `<AutoPagination>` and an `AutoPaginationProps` object without `type` now type-check. TypeScript still rejects any type but `default`, `simple` and `full`. A `Pagination` without `type` now renders exactly like `type="default"`: `PaginationContext` gives the parts inside it, your own included, `type: "default"` instead of `undefined`, and its type still says `type` is always set. `AutoPagination` without `type` already rendered like `type="default"`, and still does.

`PaginatorProps`'s JSDoc, which editors show on hover, now names the types `default`, `simple` and `full` and gives `default` as the default. It named them `basic`, `basic-alternate` and `number`.
