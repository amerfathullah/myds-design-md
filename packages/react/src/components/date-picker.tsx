import { FC, ReactElement } from "react";
import { Matcher } from "react-day-picker";
import { enGB, ms } from "react-day-picker/locale";
import { format } from "date-fns";
import { useControllableState } from "../hooks";
import { useTriggerNames } from "../hooks/use-trigger-names";
import { CalendarIcon } from "../icons/calendar";
import { Button, button_cva, ButtonIcon } from "./button";
import { Calendar } from "./calendar";
import { Dialog, DialogBody, DialogContent, DialogTrigger } from "./dialog";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { VariantProps } from "class-variance-authority";

type DatePickerProps = {
  defaultValue?: Date;
  disabled?: Matcher | Matcher[];
  formatStr?: string;
  icon?: ReactElement;
  locale?: "en" | "ms";
  maxYear?: number;
  minYear?: number;
  /**
   * Accessible name of the calendar's previous button in its month view,
   * which goes back a year. Screen readers announce it; it isn't shown. Set
   * it in your site's language.
   * @default "Go to the Previous Year"
   */
  previousYearLabel?: string;
  /**
   * Accessible name of the calendar's next button in its month view, which
   * goes forward a year. Screen readers announce it; it isn't shown. Set it
   * in your site's language.
   * @default "Go to the Next Year"
   */
  nextYearLabel?: string;
  placeholder?: string;
  value?: Date;
  onValueChange?: (date: Date) => void;
  size?: VariantProps<typeof button_cva>["size"];
  yearOrder?: "asc" | "desc";
  /**
   * The id of the field's visible label, such as a Label's `id`. Every
   * trigger is named by it, followed by what the trigger shows, e.g. "Date of
   * birth 12 Mar 2024". A Label's `htmlFor` can't name the picker, so use
   * this.
   */
  "aria-labelledby"?: string;
  /**
   * Accessible name of the picker, when no visible label names it. Every
   * trigger is named by it, followed by what the trigger shows, e.g. "Tarikh
   * lahir 12 Mac 2024". Screen readers announce it; it isn't shown. Set it in
   * your site's language. `aria-labelledby` wins if you pass both.
   */
  "aria-label"?: string;
  /**
   * The id of an element whose text describes the picker, such as a hint
   * under its label. Every trigger takes it.
   */
  "aria-describedby"?: string;
};

/**
 * The DatePicker component allows users to select a date from an interactive calendar.
 * @see {@link https://design.digital.gov.my/?path=/docs/myds-react-datepicker--docs}
 */
const DatePicker: FC<DatePickerProps> = ({
  defaultValue,
  disabled,
  formatStr = "dd MMM yyy",
  icon,
  locale = "en",
  onValueChange,
  placeholder = "dd / mm / yyyy",
  value,
  size,
  "aria-labelledby": ariaLabelledBy,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  ...props
}) => {
  const [date, setDate] = useControllableState({
    prop: value,
    onChange: onValueChange,
    defaultProp: defaultValue,
  });

  const { id, hiddenLabel, labelledBy } = useTriggerNames(
    ariaLabelledBy,
    ariaLabel,
  );
  // The id of the element in each trigger that holds its text
  const dialogTextId = `${id}dialog-text`;
  const popoverTextId = `${id}popover-text`;

  const _locale = locale === "en" ? enGB : ms;
  const formatDate = (date: Date) =>
    format(date, formatStr, {
      locale: _locale,
    });

  return (
    <>
      {hiddenLabel}

      {/* Mobile */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="default-outline"
            size={size}
            className="flex lg:hidden"
            disabled={disabled === true}
            aria-labelledby={labelledBy(dialogTextId)}
            aria-describedby={ariaDescribedBy}
          >
            <ButtonIcon>{icon ?? <CalendarIcon />}</ButtonIcon>
            <span id={dialogTextId}>
              {date ? formatDate(date) : placeholder}
            </span>
          </Button>
        </DialogTrigger>
        <DialogBody hideClose className="sm:w-fit">
          <DialogContent className="p-0">
            <Calendar
              disabled={disabled}
              locale={_locale}
              mode="single"
              month={date}
              onSelect={setDate}
              required
              selected={date}
              {...props}
            />
          </DialogContent>
        </DialogBody>
      </Dialog>

      {/* Desktop */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="default-outline"
            size={size}
            className="hidden lg:flex"
            disabled={disabled === true}
            aria-labelledby={labelledBy(popoverTextId)}
            aria-describedby={ariaDescribedBy}
          >
            <ButtonIcon>{icon ?? <CalendarIcon />}</ButtonIcon>
            <span id={popoverTextId}>
              {date ? formatDate(date) : placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[304px] p-0" align="start">
          <Calendar
            disabled={disabled}
            locale={_locale}
            mode="single"
            month={date}
            onSelect={setDate}
            required
            selected={date}
            {...props}
          />
        </PopoverContent>
      </Popover>
    </>
  );
};
DatePicker.displayName = "DatePicker";

export { DatePicker };
