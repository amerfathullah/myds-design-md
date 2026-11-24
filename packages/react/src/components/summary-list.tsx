import {
  ComponentProps,
  ComponentPropsWithoutRef,
  forwardRef,
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from "react";
import { Slot } from "@radix-ui/react-slot";
import { clx } from "../utils";

// Every part forwards its ref to the element it renders, so a ref works on
// React 18, which gives a plain function component none, as well as on 19

const SummaryList: ForwardRefExoticComponent<ComponentProps<"div">> =
  forwardRef(({ children, className, ...props }, ref) => (
    <div ref={ref} className={clx("space-y-6", className)} {...props}>
      {children}
    </div>
  ));
SummaryList.displayName = "SummaryList";

/**
 * The list's title: an `<h2>` by default. With `asChild`, it renders its one
 * child in its place, so you can give it the heading level your page needs,
 * e.g. an `<h3>` under an `<h2>` section.
 */
const SummaryListHeader: ForwardRefExoticComponent<
  ComponentPropsWithoutRef<"h2"> & {
    asChild?: boolean;
  } & RefAttributes<HTMLHeadingElement>
> = forwardRef(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "h2";
  return (
    <Comp
      ref={ref}
      className={clx(
        "text-txt-black-900 text-xl font-semibold leading-[30px]",
        className,
      )}
      {...props}
    />
  );
});
SummaryListHeader.displayName = "SummaryListHeader";

/**
 * The list's rows, in a `<tbody>` inside a `<table>`. Its ref is the
 * `<table>`, not the `<tbody>`.
 */
const SummaryListBody: ForwardRefExoticComponent<ComponentProps<"table">> =
  forwardRef(({ children, className, ...props }, ref) => (
    <table
      ref={ref}
      className={clx(
        "w-full text-sm font-medium",
        "min-h-[40px]",
        "relative",
        className,
      )}
      {...props}
    >
      <tbody>{children}</tbody>
    </table>
  ));
SummaryListBody.displayName = "SummaryListBody";

const SummaryListRow: ForwardRefExoticComponent<ComponentProps<"tr">> =
  forwardRef(({ children, className, ...props }, ref) => (
    <tr
      ref={ref}
      className={clx("border-otl-gray-200 border-b", className)}
      {...props}
    >
      {children}
    </tr>
  ));
SummaryListRow.displayName = "SummaryListRow";

// The term and the action stay table cells, with no `display` of their own,
// so `colSpan` and `rowSpan` work on them and a row without a detail puts
// its action in the next column. A flex cell isn't a table cell: the browser
// wraps it in an anonymous cell, which ignores its spans. Each lays its
// children out in a flex row inside it instead, as the cell itself once did,
// and `dangerouslySetInnerHTML` fills that wrapper as children would.

/**
 * The row's header, a `<th scope="row">` on the row's baseline. Its children
 * sit in a row inside it, from its start edge. `className` and the other
 * props go on the `<th>`, so flex classes such as `gap-2` don't reach the
 * children: put those on your own wrapper. To widen its column, set its
 * `min-width`, not its `width`: the detail takes all the width the columns'
 * minimums leave.
 */
const SummaryListTerm: ForwardRefExoticComponent<ComponentProps<"td">> =
  forwardRef(
    ({ children, className, dangerouslySetInnerHTML, ...props }, ref) => (
      <th
        ref={ref}
        // scope equals row here to indicate the header relates to all the row it belongs to
        scope="row"
        className={clx(
          "text-txt-black-500 min-w-[190px] py-3 pr-3 align-baseline",
          className,
        )}
        {...props}
      >
        <div
          className="flex items-start"
          dangerouslySetInnerHTML={dangerouslySetInnerHTML}
        >
          {children}
        </div>
      </th>
    ),
  );
SummaryListTerm.displayName = "SummaryListTerm";

const SummaryListDetail: ForwardRefExoticComponent<ComponentProps<"td">> =
  forwardRef(({ children, className, ...props }, ref) => (
    <td
      ref={ref}
      className={clx("text-txt-black-900 w-full py-3 pr-3", className)}
      {...props}
    >
      {children}
    </td>
  ));
SummaryListDetail.displayName = "SummaryListDetail";

// Whether React renders `node` as nothing: `null`, `undefined`, a boolean,
// `""`, or an array of those. It reads nothing else, since an iterator such
// as `map.values()` can be read only once, and React has to read it.
const rendersNothing = (node: ReactNode): boolean =>
  node == null ||
  typeof node === "boolean" ||
  node === "" ||
  (Array.isArray(node) && node.every(rendersNothing));

/**
 * The row's actions, in a `<td>` on the row's baseline. Its children sit in
 * a row inside it, against its end edge. `className` and the other props go
 * on the `<td>`, so flex classes such as `gap-2` don't reach the children:
 * put those on your own wrapper. With no children, or only `null`,
 * `undefined`, booleans or `""`, it's an empty cell; a component that renders
 * nothing, or an empty fragment, still leaves the wrapper in it.
 */
const SummaryListAction: ForwardRefExoticComponent<ComponentProps<"td">> =
  forwardRef(
    ({ children, className, dangerouslySetInnerHTML, ...props }, ref) => {
      // With nothing to show, it renders no wrapper, so CSS's `:empty`
      // matches it, as it did when the action was the flex box. React sets
      // `__html` as a string, and a child component that renders nothing
      // can't be seen here.
      const html = dangerouslySetInnerHTML?.__html;
      const isEmpty =
        (html == null || String(html) === "") && rendersNothing(children);
      return (
        <td
          ref={ref}
          className={clx("py-1.5 pr-3 text-right align-baseline", className)}
          {...props}
        >
          {!isEmpty && (
            // `flex-1` does nothing in a table cell. It fills an action made a
            // flex box, as one hidden on small screens may be, so its buttons
            // stay at its end edge.
            <div
              className="flex flex-1 justify-end"
              dangerouslySetInnerHTML={dangerouslySetInnerHTML}
            >
              {children}
            </div>
          )}
        </td>
      );
    },
  );
SummaryListAction.displayName = "SummaryListAction";

const SummaryListAddition: ForwardRefExoticComponent<ComponentProps<"td">> =
  forwardRef(({ children, className, ...props }, ref) => (
    <td
      ref={ref}
      className={clx("text-txt-black-900 min-w-36 py-2 pr-3", className)}
      {...props}
    >
      {children}
    </td>
  ));
SummaryListAddition.displayName = "SummaryListAddition";

export {
  SummaryList,
  SummaryListHeader,
  SummaryListBody,
  SummaryListRow,
  SummaryListTerm,
  SummaryListDetail,
  SummaryListAction,
  SummaryListAddition,
};
