import { FC } from "react";
import { DateAfter, DateBefore, DateRange, Matcher } from "react-day-picker";
import { enGB, ms } from "react-day-picker/locale";
import { format } from "date-fns";
import { useControllableState } from "../hooks";
import { useTriggerNames } from "../hooks/use-trigger-names";
import { Button, button_cva } from "./button";
import { Calendar } from "./calendar";
import { Dialog, DialogBody, DialogContent, DialogTrigger } from "./dialog";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { VariantProps } from "class-variance-authority";

export type DateRangePickerProps = {
  defaultValue?: DateRange;
  disabled?: Matcher | Matcher[];
  excludeDisabled?: boolean;
  formatStr?: string;
  fromLabel?: string;
  locale?: "en" | "ms";
  maxYear?: number;
  minYear?: number;
  /**
   * Accessible name of the calendars' previous button in their month view,
   * which goes back a year. Screen readers announce it; it isn't shown. Set
   * it in your site's language.
   * @default "Go to the Previous Year"
   */
  previousYearLabel?: string;
  /**
   * Accessible name of the calendars' next button in their month view, which
   * goes forward a year. Screen readers announce it; it isn't shown. Set it
   * in your site's language.
   * @default "Go to the Next Year"
   */
  nextYearLabel?: string;
  onValueChange?: (date: DateRange) => void;
  placeholder?: string;
  value?: DateRange;
  size?: VariantProps<typeof button_cva>["size"];
  toLabel?: string;
  yearOrder?: "asc" | "desc";
  /**
   * The id of the field's visible label, such as a Label's `id`. Every
   * trigger is named by it, followed by what the trigger shows, e.g. "Travel
   * dates From: 12 Mar 2024". A Label's `htmlFor` can't name the picker, so
   * use this.
   */
  "aria-labelledby"?: string;
  /**
   * Accessible name of the picker, when no visible label names it. Every
   * trigger is named by it, followed by what the trigger shows, e.g. "Tarikh
   * perjalanan Dari: 12 Mac 2024". Screen readers announce it; it isn't
   * shown. Set it in your site's language. `aria-labelledby` wins if you pass
   * both.
   */
  "aria-label"?: string;
  /**
   * The id of an element whose text describes the picker, such as a hint
   * under its label. Every trigger takes it.
   */
  "aria-describedby"?: string;
};

// The triggers DateRangePicker renders: a dialog's and a popover's for each
// end of the range
type Trigger = "dialog-from" | "dialog-to" | "popover-from" | "popover-to";

/**
 * The DateRangePicker component allows users to select a range of dates from an interactive calendar.
 * @see {@link https://design.digital.gov.my/?path=/docs/myds-react-daterangepicker--docs}
 */
const DateRangePicker: FC<DateRangePickerProps> = ({
  defaultValue,
  disabled,
  formatStr = "dd MMM yyy",
  fromLabel,
  locale = "en",
  onValueChange,
  placeholder = "dd / mm / yyyy",
  value,
  size,
  toLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  ...props
}) => {
  const [selectedDateRange, setSelectedDateRange] = useControllableState({
    prop: value,
    onChange: onValueChange,
    defaultProp: defaultValue,
  });

  const names = useTriggerNames(ariaLabelledBy, ariaLabel);
  // The ids of the elements in each trigger that hold its prefix and its date
  const prefixId = (trigger: Trigger) => `${names.id}${trigger}-prefix`;
  const dateId = (trigger: Trigger) => `${names.id}${trigger}-date`;
  // A trigger's `aria-labelledby`: the label, then its prefix and date
  const labelledBy = (trigger: Trigger) =>
    names.labelledBy(prefixId(trigger), dateId(trigger));

  const isMS = locale === "ms";
  const _locale = isMS ? ms : enGB;
  const formatDate = (date: Date) =>
    format(date, formatStr, {
      locale: _locale,
    });

  const dateBefore: DateBefore = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    before: selectedDateRange?.from!,
  };
  const dateAfter: DateAfter = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    after: selectedDateRange?.to!,
  };

  return (
    <>
      {names.hiddenLabel}

      {/* Mobile */}
      <div className="text-txt-black-900 flex items-center gap-1.5 lg:hidden">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="default-outline"
              size={size}
              className="whitespace-nowrap"
              aria-labelledby={labelledBy("dialog-from")}
              aria-describedby={ariaDescribedBy}
            >
              <span id={prefixId("dialog-from")} className="text-txt-black-500">
                {fromLabel ? fromLabel : isMS ? "Dari:" : "From:"}
              </span>
              <span id={dateId("dialog-from")}>
                {selectedDateRange?.from
                  ? formatDate(selectedDateRange.from)
                  : placeholder}
              </span>
            </Button>
          </DialogTrigger>
          <DialogBody className="w-fit min-w-fit" hideClose>
            <DialogContent className="w-[304px] p-0">
              <Calendar
                disabled={
                  selectedDateRange?.to
                    ? disabled
                      ? Array.isArray(disabled)
                        ? [...disabled, dateAfter]
                        : [disabled, dateAfter]
                      : dateAfter
                    : disabled
                }
                locale={_locale}
                mode="range"
                month={selectedDateRange?.from}
                onSelect={({ from, to }) => {
                  const date = from === selectedDateRange?.from ? to : from;
                  setSelectedDateRange({ ...selectedDateRange, from: date });
                }}
                required
                selected={selectedDateRange}
                daterange="from"
                {...props}
              />
            </DialogContent>
          </DialogBody>
        </Dialog>
        -
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="default-outline"
              size={size}
              className="whitespace-nowrap"
              aria-labelledby={labelledBy("dialog-to")}
              aria-describedby={ariaDescribedBy}
            >
              <span id={prefixId("dialog-to")} className="text-txt-black-500">
                {toLabel ? toLabel : isMS ? "Hingga:" : "To:"}
              </span>
              <span id={dateId("dialog-to")}>
                {selectedDateRange?.to
                  ? formatDate(selectedDateRange.to)
                  : placeholder}
              </span>
            </Button>
          </DialogTrigger>
          <DialogBody className="w-fit min-w-fit" hideClose>
            <DialogContent className="w-[304px] p-0">
              <Calendar
                disabled={
                  selectedDateRange?.from
                    ? disabled
                      ? Array.isArray(disabled)
                        ? [...disabled, dateBefore]
                        : [disabled, dateBefore]
                      : dateBefore
                    : disabled
                }
                locale={_locale}
                mode="range"
                month={selectedDateRange?.to}
                onSelect={setSelectedDateRange}
                required
                selected={selectedDateRange}
                daterange="to"
                {...props}
              />
            </DialogContent>
          </DialogBody>
        </Dialog>
      </div>

      {/* Desktop */}
      <div className="text-txt-black-900 hidden items-center gap-1.5 lg:flex">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="default-outline"
              size={size}
              className="whitespace-nowrap"
              aria-labelledby={labelledBy("popover-from")}
              aria-describedby={ariaDescribedBy}
            >
              <span
                id={prefixId("popover-from")}
                className="text-txt-black-500"
              >
                {fromLabel ? fromLabel : isMS ? "Dari:" : "From:"}
              </span>
              <span id={dateId("popover-from")}>
                {selectedDateRange?.from
                  ? formatDate(selectedDateRange.from)
                  : placeholder}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[304px] p-0" align="start">
            <Calendar
              disabled={
                selectedDateRange?.to
                  ? disabled
                    ? Array.isArray(disabled)
                      ? [...disabled, dateAfter]
                      : [disabled, dateAfter]
                    : dateAfter
                  : disabled
              }
              locale={_locale}
              mode="range"
              month={selectedDateRange?.from}
              onSelect={({ from, to }) => {
                const date = from === selectedDateRange?.from ? to : from;
                setSelectedDateRange({ ...selectedDateRange, from: date });
              }}
              required
              selected={selectedDateRange}
              daterange="from"
              {...props}
            />
          </PopoverContent>
        </Popover>
        -
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="default-outline"
              size={size}
              className="whitespace-nowrap"
              aria-labelledby={labelledBy("popover-to")}
              aria-describedby={ariaDescribedBy}
            >
              <span id={prefixId("popover-to")} className="text-txt-black-500">
                {toLabel ? toLabel : isMS ? "Hingga:" : "To:"}
              </span>
              <span id={dateId("popover-to")}>
                {selectedDateRange?.to
                  ? formatDate(selectedDateRange.to)
                  : placeholder}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[304px] p-0" align="end">
            <Calendar
              disabled={
                selectedDateRange?.from
                  ? disabled
                    ? Array.isArray(disabled)
                      ? [...disabled, dateBefore]
                      : [disabled, dateBefore]
                    : dateBefore
                  : disabled
              }
              locale={_locale}
              mode="range"
              month={selectedDateRange?.to}
              onSelect={setSelectedDateRange}
              required
              selected={selectedDateRange}
              daterange="to"
              {...props}
            />
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
};
DateRangePicker.displayName = "DateRangePicker";

export { DateRangePicker };

export type { DateRange };
