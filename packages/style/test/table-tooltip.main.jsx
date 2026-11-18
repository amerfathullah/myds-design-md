// The table entry as it was on main (d8b8137): every part as it is now, but
// TableTooltip as it was then, a bare trigger around its icon with no hit
// area. table-tooltip.test.mjs bundles its page a second time with this
// module in place of the table entry, DataTable's import of it included, and
// checks that the hit area moves nothing main's trigger placed. Keep it as
// main had it.
import { forwardRef } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../react/src/components/tooltip";
import { QuestionCircleIcon } from "../../react/src/icons";

export * from "../../react/src/components/table";

// main's ignored its ref, and sent every prop but `aria-label` to the root
export const TableTooltip = forwardRef(
  ({ children, "aria-label": ariaLabel = "Tooltip", ...props }, _ref) => (
    <Tooltip {...props}>
      <TooltipTrigger aria-label={ariaLabel}>
        <QuestionCircleIcon className="text-txt-black-500 size-4 cursor-help" />
      </TooltipTrigger>
      <TooltipContent side="top" align="center">
        {children}
      </TooltipContent>
    </Tooltip>
  ),
);
TableTooltip.displayName = "TableTooltip";
