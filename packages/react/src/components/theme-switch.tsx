import { FunctionComponent, isValidElement, ReactNode } from "react";
import { DesktopIcon, MoonIcon, SunIcon } from "../icons";
import { Button } from "./button";
import { useTheme } from "../hooks/use-theme";
import {
  Select,
  SelectValue,
  SelectItem,
  SelectTrigger,
  SelectContent,
} from "./select";
import { Slot } from "@radix-ui/react-slot";

interface Theme {
  label: string;
  value: string;
  icon: ReactNode;
}

interface ThemeSwitch {
  as?: "toggle" | "select";
  themes?: Array<Theme>;
  onChange?: (value: string) => void;
  /** Accessible name of the select trigger when `as="select"`; announced, not shown. */
  selectLabel?: string;
  /** Accessible name of the toggle while the provider's theme isn't one of this switch's `themes`, when `as="toggle"`; announced, not shown. */
  toggleLabel?: string;
}

const ThemeSwitch: FunctionComponent<ThemeSwitch> = ({
  as = "toggle",
  themes = [
    { label: "Light", value: "light", icon: <SunIcon /> },
    { label: "Dark", value: "dark", icon: <MoonIcon /> },
  ],
  onChange,
  selectLabel = "Theme",
  toggleLabel = "Theme",
}) => {
  const { theme, setTheme, defaultTheme } = useTheme();
  // The provider's theme in `themes`, worked out on every render, so the
  // server HTML already shows it. It's -1 while the theme is unlisted: one
  // `themes` doesn't hold, such as "system" chosen in another switch.
  const currentIndex = themes.findIndex((t) => t.value === theme);
  const current = themes[currentIndex];

  const getTheme = (value: string) =>
    themes.find((theme) => theme.value === value);

  // An element icon is drawn at 16px in `txt-black-900`; any other icon,
  // such as an emoji, as given
  const styledIcon = (icon: ReactNode) =>
    isValidElement(icon) ? (
      <Slot className={"text-txt-black-900 size-4 flex-shrink-0"}>{icon}</Slot>
    ) : (
      icon
    );

  // What both forms show while the theme is unlisted, as System is most often
  const unlistedIcon = styledIcon(<DesktopIcon />);

  const change = (value: string) => {
    setTheme(value);
    if (onChange) onChange(value);
  };

  /*------------------ as toggle -----------------*/
  if (as === "toggle")
    return (
      <Button
        variant="default-ghost"
        className="aspect-square flex-shrink-0 rounded-md"
        // The next theme, or the first while the theme is unlisted. A switch
        // with nothing else to switch to does nothing.
        onClick={() => {
          const next = themes[(currentIndex + 1) % themes.length]?.value;
          if (next !== undefined && next !== theme) change(next);
        }}
        size="small"
        aria-label={current ? current.label : toggleLabel}
        iconOnly
      >
        {current ? styledIcon(current.icon) || current.label : unlistedIcon}
      </Button>
    );

  /*------------------ as select -----------------*/

  return (
    <Select
      size="small"
      variant="outline"
      value={theme || defaultTheme}
      // Radix's Select calls it only for a theme other than its value
      onValueChange={(value) => value && change(value)}
    >
      <SelectTrigger aria-label={selectLabel}>
        <SelectValue>
          {(value) => {
            const selected = getTheme(value as string);
            // An unlisted value shows the icon alone: text would be read
            // after the trigger's name, as "Theme, Theme"
            return (
              <div className="flex items-center gap-2">
                <div>{selected ? styledIcon(selected.icon) : unlistedIcon}</div>
                {selected && <span>{selected.label}</span>}
              </div>
            );
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end">
        {themes.map((theme) => (
          <SelectItem
            key={theme.value}
            value={theme.value}
            aria-label={theme.label}
          >
            {theme.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

ThemeSwitch.displayName = "ThemeSwitch";

export { ThemeSwitch };
