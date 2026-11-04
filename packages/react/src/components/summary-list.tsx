import {
  ComponentProps,
  ComponentPropsWithoutRef,
  forwardRef,
  ForwardRefExoticComponent,
  FunctionComponent,
  RefAttributes,
} from "react";
import { Slot } from "@radix-ui/react-slot";
import { clx } from "../utils";

const SummaryList: FunctionComponent<ComponentProps<"div">> = ({
  children,
  className,
  ...props
}) => (
  <div className={clx("space-y-6", className)} {...props}>
    {children}
  </div>
);

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

const SummaryListBody: FunctionComponent<ComponentProps<"table">> = ({
  children,
  className,
  ...props
}) => (
  <table
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
);

const SummaryListRow: FunctionComponent<ComponentProps<"tr">> = ({
  children,
  className,
  ...props
}) => (
  <tr className={clx("border-otl-gray-200 border-b", className)} {...props}>
    {children}
  </tr>
);

const SummaryListTerm: FunctionComponent<ComponentProps<"td">> = ({
  children,
  className,
  ...props
}) => (
  <th
    // scope equals row here to indicate the header relates to all the row it belongs to
    scope="row"
    className={clx(
      "text-txt-black-500 flex min-w-[190px] items-start py-3 pr-3",
      className,
    )}
    {...props}
  >
    {children}
  </th>
);

const SummaryListDetail: FunctionComponent<ComponentProps<"td">> = ({
  children,
  className,
  ...props
}) => (
  <td
    className={clx("text-txt-black-900 w-full py-3 pr-3", className)}
    {...props}
  >
    {children}
  </td>
);

const SummaryListAction: FunctionComponent<ComponentProps<"td">> = ({
  children,
  className,
  ...props
}) => (
  <td
    className={clx("flex justify-end py-1.5 pr-3 text-right", className)}
    {...props}
  >
    {children}
  </td>
);

const SummaryListAddition: FunctionComponent<ComponentProps<"td">> = ({
  children,
  className,
  ...props
}) => (
  <td
    className={clx("text-txt-black-900 min-w-36 py-2 pr-3", className)}
    {...props}
  >
    {children}
  </td>
);

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
