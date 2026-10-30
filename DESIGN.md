---
version: alpha
name: MYDS
description: An unofficial description of the Malaysian Government Design System as built in `@amerfathullah/myds-react` and `@amerfathullah/myds-style`, for official Malaysian government services only. A calm, institutional, accessibility-first utility for government digital services. A white canvas and near-black text, one blue primary kept for action and selection, Poppins headings over an Inter body, status colours kept for status, and a light and a dark theme driven by semantic tokens. Every page sits in a fixed frame of SkipLink, Masthead (Malaysia flag), Navbar and Footer, on a 12-8-4 grid.

colors:
  white: "#FFFFFF"
  gray-50: "#FAFAFA"
  gray-100: "#F4F4F5"
  gray-200: "#E4E4E7"
  gray-300: "#D4D4D8"
  gray-400: "#A1A1AA"
  gray-500: "#6B6B74"
  gray-600: "#52525B"
  gray-700: "#3F3F46"
  gray-800: "#27272A"
  gray-850: "#1D1D21"
  gray-900: "#18181B"
  gray-930: "#161619"
  gray-950: "#09090B"
  primary-50: "#EFF6FF"
  primary-100: "#DBEAFE"
  primary-200: "#C2D5FF"
  primary-300: "#96B7FF"
  primary-400: "#6394FF"
  primary-500: "#3A75F6"
  primary-600: "#2563EB"
  primary-700: "#1D4ED8"
  primary-800: "#1E40AF"
  primary-900: "#1E3A8A"
  primary-950: "#172554"
  danger-50: "#FEF2F2"
  danger-100: "#FEE2E2"
  danger-200: "#FECACA"
  danger-300: "#FCA5A5"
  danger-400: "#F87171"
  danger-500: "#EF4444"
  danger-600: "#DC2626"
  danger-700: "#B91C1C"
  danger-800: "#991B1B"
  danger-900: "#7F1D1D"
  danger-950: "#450A0A"
  success-50: "#F0FDF4"
  success-100: "#DCFCE7"
  success-200: "#BBF7D0"
  success-300: "#83DAA3"
  success-400: "#4ADE80"
  success-500: "#22C55E"
  success-600: "#16A34A"
  success-700: "#15803D"
  success-800: "#166534"
  success-900: "#14532D"
  success-950: "#052E16"
  warning-50: "#FEFCE8"
  warning-100: "#FEF9C3"
  warning-200: "#FEF08A"
  warning-300: "#FDE047"
  warning-400: "#FACC15"
  warning-500: "#EAB308"
  warning-600: "#CA8A04"
  warning-700: "#A16207"
  warning-800: "#854D0E"
  warning-900: "#713F12"
  warning-950: "#422006"
  white-disabled: "#FFFFFF66"
  bg-white: "{colors.white}"
  bg-white-hover: "{colors.gray-50}"
  bg-white-disabled: "#F4F4F566"
  bg-washed: "{colors.gray-100}"
  bg-washed-active: "{colors.gray-100}"
  bg-contrast: "{colors.white}"
  bg-dialog: "{colors.white}"
  bg-dialog-active: "{colors.white}"
  bg-black-900: "{colors.gray-900}"
  bg-black-800: "{colors.gray-800}"
  bg-black-700: "{colors.gray-700}"
  bg-black-500: "{colors.gray-500}"
  bg-black-400: "{colors.gray-400}"
  bg-black-300: "{colors.gray-300}"
  bg-black-200: "{colors.gray-200}"
  bg-black-100: "{colors.gray-100}"
  bg-black-50: "{colors.gray-50}"
  bg-black-disabled: "#18181B66"
  bg-gray-50: "{colors.gray-50}"
  bg-primary-50: "{colors.primary-50}"
  bg-primary-100: "{colors.primary-100}"
  bg-primary-200: "{colors.primary-200}"
  bg-primary-300: "{colors.primary-300}"
  bg-primary-400: "{colors.primary-400}"
  bg-primary-500: "{colors.primary-500}"
  bg-primary-600: "{colors.primary-600}"
  bg-primary-700: "{colors.primary-700}"
  bg-primary-800: "{colors.primary-800}"
  bg-primary-900: "{colors.primary-900}"
  bg-primary-950: "{colors.primary-950}"
  bg-primary-disabled: "{colors.primary-200}"
  bg-danger-50: "{colors.danger-50}"
  bg-danger-100: "{colors.danger-100}"
  bg-danger-200: "{colors.danger-200}"
  bg-danger-300: "{colors.danger-300}"
  bg-danger-400: "{colors.danger-400}"
  bg-danger-500: "{colors.danger-500}"
  bg-danger-600: "{colors.danger-600}"
  bg-danger-700: "{colors.danger-700}"
  bg-danger-800: "{colors.danger-800}"
  bg-danger-900: "{colors.danger-900}"
  bg-danger-950: "{colors.danger-950}"
  bg-danger-disabled: "{colors.danger-200}"
  bg-success-50: "{colors.success-50}"
  bg-success-100: "{colors.success-100}"
  bg-success-200: "{colors.success-200}"
  bg-success-300: "{colors.success-300}"
  bg-success-400: "{colors.success-400}"
  bg-success-500: "{colors.success-500}"
  bg-success-600: "{colors.success-600}"
  bg-success-700: "{colors.success-700}"
  bg-success-800: "{colors.success-800}"
  bg-success-900: "{colors.success-900}"
  bg-success-950: "{colors.success-950}"
  bg-success-disabled: "{colors.success-200}"
  bg-warning-50: "{colors.warning-50}"
  bg-warning-100: "{colors.warning-100}"
  bg-warning-200: "{colors.warning-200}"
  bg-warning-300: "{colors.warning-300}"
  bg-warning-400: "{colors.warning-400}"
  bg-warning-500: "{colors.warning-500}"
  bg-warning-600: "{colors.warning-600}"
  bg-warning-700: "{colors.warning-700}"
  bg-warning-800: "{colors.warning-800}"
  bg-warning-900: "{colors.warning-900}"
  bg-warning-950: "{colors.warning-950}"
  bg-warning-disabled: "{colors.warning-200}"
  txt-white: "{colors.white}"
  txt-white-disabled: "#FFFFFF66"
  txt-black-900: "{colors.gray-900}"
  txt-black-700: "{colors.gray-700}"
  txt-black-500: "{colors.gray-500}"
  txt-black-disabled: "#52525B66"
  txt-primary: "{colors.primary-600}"
  txt-primary-disabled: "#2563EB66"
  txt-danger: "{colors.danger-700}"
  txt-danger-disabled: "#DC262666"
  txt-success: "{colors.success-700}"
  txt-success-disabled: "#15803D66"
  txt-warning: "{colors.warning-700}"
  txt-warning-disabled: "#A1620766"
  otl-divider: "{colors.gray-100}"
  otl-gray-200: "{colors.gray-200}"
  otl-gray-300: "{colors.gray-300}"
  otl-primary-disabled: "#C2D5FF66"
  otl-primary-200: "{colors.primary-200}"
  otl-primary-300: "{colors.primary-300}"
  otl-danger-disabled: "#FECACA66"
  otl-danger-200: "{colors.danger-200}"
  otl-danger-300: "{colors.danger-300}"
  otl-success-disabled: "#BBF7D066"
  otl-success-200: "{colors.success-200}"
  otl-success-300: "{colors.success-300}"
  otl-warning-disabled: "#FEF08A66"
  otl-warning-200: "{colors.warning-200}"
  otl-warning-300: "{colors.danger-300}"
  fr-primary: "#96B7FF66"
  fr-danger: "#FCA5A566"

typography:
  heading-xl:
    fontSize: 60px
    lineHeight: 72px
  heading-lg:
    fontSize: 48px
    lineHeight: 60px
  heading-md:
    fontSize: 36px
    lineHeight: 44px
  heading-sm:
    fontSize: 30px
    lineHeight: 38px
  heading-xs:
    fontSize: 24px
    lineHeight: 32px
  heading-2xs:
    fontSize: 20px
    lineHeight: 28px
  body-xl:
    fontSize: 20px
    lineHeight: 30px
  body-lg:
    fontSize: 18px
    lineHeight: 26px
  body-md:
    fontSize: 16px
    lineHeight: 24px
  body-sm:
    fontSize: 14px
    lineHeight: 20px
  body-xs:
    fontSize: 12px
    lineHeight: 18px

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 14px
  full: 9999px

spacing:
  "0.5": 2px
  "1": 4px
  "1.5": 6px
  "2": 8px
  "2.5": 10px
  "3": 12px
  "3.5": 14px
  "4": 16px
  "4.5": 18px
  "5": 20px
  "6": 24px
  "8": 32px
  "9": 36px
  "10": 40px
  "10.5": 42px
  "12": 48px
  "16": 64px

components:
  # Buttons & links
  button-primary-fill:
    backgroundColor: "{colors.primary-600}"
    textColor: "{colors.white}"
    borderColor: "{colors.primary-600}"
    typography: "{typography.body-sm}"
    fontWeight: 500
    padding: "6px 10px"
    rounded: "{rounded.md}"
  button-primary-fill-hover:
    backgroundColor: "{colors.primary-700}"
    textColor: "{colors.white}"
  button-primary-fill-disabled:
    backgroundColor: "{colors.bg-primary-disabled}"
    textColor: "{colors.white-disabled}"
    borderColor: "{colors.bg-primary-disabled}"
  button-primary-outline:
    backgroundColor: "{colors.bg-white}"
    textColor: "{colors.txt-primary}"
    borderColor: "{colors.otl-primary-200}"
    typography: "{typography.body-sm}"
    fontWeight: 500
    padding: "6px 10px"
    rounded: "{rounded.md}"
  button-primary-outline-hover:
    backgroundColor: "{colors.bg-primary-50}"
    textColor: "{colors.txt-primary}"
  button-primary-outline-disabled:
    backgroundColor: "{colors.bg-white-disabled}"
    textColor: "{colors.txt-primary-disabled}"
    borderColor: "#00000000"
  button-primary-ghost:
    textColor: "{colors.txt-primary}"
    typography: "{typography.body-sm}"
    fontWeight: 500
    padding: "6px 10px"
    rounded: "{rounded.md}"
  button-primary-ghost-hover:
    backgroundColor: "{colors.bg-primary-50}"
    textColor: "{colors.txt-primary}"
  button-primary-ghost-disabled:
    backgroundColor: "{colors.bg-white-disabled}"
    textColor: "{colors.txt-primary-disabled}"
  button-default-outline:
    backgroundColor: "{colors.bg-white}"
    textColor: "{colors.txt-black-700}"
    borderColor: "{colors.otl-gray-200}"
    typography: "{typography.body-sm}"
    fontWeight: 500
    padding: "6px 10px"
    rounded: "{rounded.md}"
  button-default-outline-hover:
    backgroundColor: "{colors.bg-white-hover}"
    textColor: "{colors.txt-black-900}"
    borderColor: "{colors.otl-gray-300}"
  button-default-outline-disabled:
    backgroundColor: "{colors.bg-white-disabled}"
    textColor: "{colors.txt-black-disabled}"
    borderColor: "#00000000"
  button-default-ghost:
    textColor: "{colors.txt-black-700}"
    typography: "{typography.body-sm}"
    fontWeight: 500
    padding: "6px 10px"
    rounded: "{rounded.md}"
  button-default-ghost-hover:
    backgroundColor: "{colors.bg-white-hover}"
    textColor: "{colors.txt-black-700}"
  button-default-ghost-disabled:
    backgroundColor: "{colors.bg-white-disabled}"
    textColor: "{colors.txt-black-disabled}"
  button-danger-fill:
    backgroundColor: "{colors.danger-600}"
    textColor: "{colors.white}"
    borderColor: "{colors.danger-600}"
    typography: "{typography.body-sm}"
    fontWeight: 500
    padding: "6px 10px"
    rounded: "{rounded.md}"
  button-danger-fill-hover:
    backgroundColor: "{colors.danger-700}"
    textColor: "{colors.white}"
  button-danger-fill-disabled:
    backgroundColor: "{colors.bg-danger-disabled}"
    textColor: "{colors.white-disabled}"
    borderColor: "{colors.bg-danger-disabled}"
  button-danger-outline:
    backgroundColor: "{colors.bg-white}"
    textColor: "{colors.txt-danger}"
    borderColor: "{colors.otl-danger-200}"
    typography: "{typography.body-sm}"
    fontWeight: 500
    padding: "6px 10px"
    rounded: "{rounded.md}"
  button-danger-outline-hover:
    backgroundColor: "{colors.bg-danger-50}"
    textColor: "{colors.txt-danger}"
  button-danger-outline-disabled:
    backgroundColor: "{colors.bg-white-disabled}"
    textColor: "{colors.txt-danger-disabled}"
    borderColor: "#00000000"
  button-danger-ghost:
    textColor: "{colors.txt-danger}"
    typography: "{typography.body-sm}"
    fontWeight: 500
    padding: "6px 10px"
    rounded: "{rounded.md}"
  button-danger-ghost-hover:
    backgroundColor: "{colors.bg-danger-50}"
    textColor: "{colors.txt-danger}"
  button-danger-ghost-disabled:
    backgroundColor: "{colors.bg-white-disabled}"
    textColor: "{colors.txt-danger-disabled}"
  button-size-small:
    typography: "{typography.body-sm}"
    fontWeight: 500
    padding: "6px 10px"
    rounded: "{rounded.md}"
  button-size-medium:
    typography: "{typography.body-md}"
    fontWeight: 500
    padding: "8px 12px"
    rounded: "{rounded.md}"
  button-size-large:
    typography: "{typography.body-lg}"
    fontWeight: 500
    padding: "10px 16px"
    rounded: "{rounded.md}"
  button-counter:
    backgroundColor: "{colors.bg-primary-600}"
    textColor: "{colors.txt-white}"
    rounded: "{rounded.full}"
  button-counter-primary-fill:
    backgroundColor: "{colors.white}"
    textColor: "{colors.primary-600}"
  button-counter-danger-fill:
    backgroundColor: "{colors.white}"
    textColor: "{colors.danger-600}"
  link-primary:
    textColor: "{colors.txt-primary}"
  spinner-gray:
    textColor: "{colors.txt-black-500}"
    size: 16px
  spinner-white:
    textColor: "{colors.white}"
    size: 16px
  spinner-size-small:
    size: 16px
  spinner-size-medium:
    size: 20px
  spinner-size-large:
    size: 24px
  theme-switch:
    textColor: "{colors.txt-black-900}"
    padding: "{spacing.2}"
    rounded: "{rounded.md}"

  # Form inputs
  input:
    backgroundColor: "{colors.bg-white}"
    textColor: "{colors.txt-black-700}"
    borderColor: "{colors.otl-gray-200}"
    typography: "{typography.body-sm}"
    padding: "6px 12px"
    rounded: "{rounded.md}"
  input-disabled:
    backgroundColor: "{colors.bg-washed}"
    textColor: "{colors.txt-black-disabled}"
  input-placeholder:
    textColor: "{colors.txt-black-500}"
  input-size-small:
    typography: "{typography.body-sm}"
    padding: "6px 12px"
  input-size-medium:
    typography: "{typography.body-md}"
    padding: "8px 12px"
  input-size-large:
    typography: "{typography.body-lg}"
    padding: "10px 14px"
  textarea:
    backgroundColor: "{colors.bg-white}"
    textColor: "{colors.txt-black-700}"
    borderColor: "{colors.otl-gray-200}"
    typography: "{typography.body-md}"
    padding: "{spacing.3}"
    rounded: "{rounded.md}"
  textarea-disabled:
    backgroundColor: "{colors.bg-washed}"
    textColor: "{colors.txt-black-disabled}"
  textarea-size-small:
    typography: "{typography.body-sm}"
    padding: "{spacing.2.5}"
  textarea-size-medium:
    typography: "{typography.body-md}"
    padding: "{spacing.3}"
  textarea-size-large:
    typography: "{typography.body-lg}"
    padding: "{spacing.3.5}"
  label:
    textColor: "{colors.txt-black-700}"
    typography: "{typography.body-md}"
  label-disabled:
    textColor: "{colors.txt-black-disabled}"
  label-size-small:
    typography: "{typography.body-sm}"
  label-size-medium:
    typography: "{typography.body-md}"
  label-size-large:
    typography: "{typography.body-lg}"
  date-field:
    backgroundColor: "{colors.bg-white}"
    textColor: "{colors.txt-black-900}"
    borderColor: "{colors.gray-200}"
    typography: "{typography.body-sm}"
    fontWeight: 400
    padding: "6px 10px"
    rounded: "{rounded.md}"
  date-field-disabled:
    backgroundColor: "{colors.bg-washed}"
    textColor: "{colors.txt-black-500}"
  date-field-invalid:
    borderColor: "{colors.otl-danger-300}"
  date-field-segment-active:
    backgroundColor: "{colors.primary-500}"
    textColor: "{colors.txt-white}"
  date-field-size-small:
    typography: "{typography.body-sm}"
    padding: "6px 10px"
  date-field-size-medium:
    typography: "{typography.body-md}"
    padding: "8px 12px"
  date-field-size-large:
    typography: "18px/28px"
    padding: "10px 14px"
  time-field:
    backgroundColor: "{colors.bg-white}"
    textColor: "{colors.txt-black-900}"
    borderColor: "{colors.gray-200}"
    typography: "{typography.body-sm}"
    fontWeight: 400
    padding: "6px 10px"
    rounded: "{rounded.md}"
  time-field-disabled:
    backgroundColor: "{colors.bg-washed}"
    textColor: "{colors.txt-black-500}"
  time-field-invalid:
    borderColor: "{colors.otl-danger-300}"
  time-field-segment-active:
    backgroundColor: "{colors.primary-500}"
    textColor: "{colors.txt-white}"
  time-field-size-small:
    typography: "{typography.body-sm}"
    padding: "6px 10px"
  time-field-size-medium:
    typography: "{typography.body-md}"
    padding: "8px 12px"
  time-field-size-large:
    typography: "18px/28px"
    padding: "10px 14px"
  date-picker-day-active:
    backgroundColor: "{colors.primary-600}"
    textColor: "{colors.white}"
  date-picker-day-range:
    backgroundColor: "{colors.bg-primary-100}"
  date-picker-day-range-hover:
    backgroundColor: "{colors.bg-primary-200}"
  date-picker-day-today:
    textColor: "{colors.txt-primary}"
  date-picker-day-disabled:
    textColor: "{colors.txt-black-disabled}"
  date-picker-weekday:
    textColor: "{colors.txt-black-500}"
    typography: "{typography.body-xs}"
  input-otp-slot:
    backgroundColor: "{colors.bg-white}"
    textColor: "{colors.txt-black-900}"
    borderColor: "{colors.otl-gray-200}"
    typography: "36px/40px"
    fontWeight: 500
    width: 50px
    height: 68px
    rounded: "{rounded.md}"
  input-otp-slot-active:
    borderColor: "{colors.otl-primary-300}"
  input-otp-slot-invalid:
    borderColor: "{colors.otl-danger-300}"
  input-otp-slot-disabled:
    backgroundColor: "{colors.bg-washed}"
    textColor: "{colors.txt-black-500}"
  search-bar:
    backgroundColor: "{colors.bg-white}"
    textColor: "{colors.txt-black-900}"
    borderColor: "{colors.otl-gray-200}"
    padding: "7px 10px 7px 12px"
    rounded: "{rounded.md}"
  search-bar-size-small:
    typography: "{typography.body-sm}"
    padding: "6px 8px 6px 10px"
    rounded: "{rounded.sm}"
  search-bar-size-medium:
    padding: "7px 10px 7px 12px"
    rounded: "{rounded.md}"
  search-bar-size-large:
    padding: "6px 6px 6px 18px"
    rounded: "{rounded.full}"
  search-bar-submit:
    backgroundColor: "{colors.primary-600}"
    textColor: "{colors.white}"
    borderColor: "{colors.primary-600}"
    padding: "{spacing.1}"
    rounded: "{rounded.full}"
  search-bar-results:
    backgroundColor: "{colors.bg-white}"
    borderColor: "{colors.otl-gray-200}"
    typography: "{typography.body-sm}"
    padding: "8px 6px"
  search-bar-result:
    textColor: "{colors.txt-black-900}"
    padding: "8px 12px"
    rounded: "{rounded.md}"
  search-bar-result-active:
    backgroundColor: "{colors.bg-washed}"
    textColor: "{colors.txt-black-900}"
  pill:
    backgroundColor: "{colors.bg-dialog}"
    textColor: "{colors.txt-black-700}"
    borderColor: "{colors.otl-gray-300}"
    typography: "{typography.body-sm}"
    fontWeight: 500
    padding: "4px 8px"
    rounded: "{rounded.sm}"
  pill-disabled:
    backgroundColor: "{colors.bg-white-disabled}"
    textColor: "{colors.txt-black-disabled}"
    borderColor: "{colors.otl-gray-200}"
  pill-size-small:
    typography: "{typography.body-xs}"
    padding: "2px 6px"
  pill-size-medium:
    typography: "{typography.body-sm}"
    padding: "4px 8px"
  pill-size-large:
    typography: "{typography.body-md}"
    padding: "4px 10px"

  # Selection controls
  checkbox:
    backgroundColor: "{colors.bg-white}"
    borderColor: "{colors.otl-gray-200}"
    size: 16px
    rounded: "{rounded.xs}"
  checkbox-hover:
    borderColor: "{colors.otl-gray-300}"
  checkbox-checked:
    backgroundColor: "{colors.primary-600}"
    textColor: "{colors.white}"
  checkbox-checked-hover:
    backgroundColor: "{colors.primary-700}"
    textColor: "{colors.white}"
  checkbox-disabled:
    backgroundColor: "{colors.bg-washed}"
  checkbox-size-small:
    size: 16px
    rounded: "{rounded.xs}"
  checkbox-size-medium:
    size: 20px
    rounded: 5px
  checkbox-size-large:
    size: 20px
    rounded: 5px
  radio:
    borderColor: "{colors.otl-gray-200}"
    size: 20px
    rounded: "{rounded.full}"
  radio-hover:
    borderColor: "{colors.otl-gray-300}"
  radio-checked:
    backgroundColor: "{colors.primary-600}"
  radio-disabled:
    backgroundColor: "{colors.bg-washed}"
  radio-label:
    textColor: "{colors.txt-black-700}"
    typography: "{typography.body-md}"
    fontWeight: 500
  radio-label-disabled:
    textColor: "{colors.txt-black-disabled}"
  radio-hint:
    textColor: "{colors.txt-black-500}"
    typography: "{typography.body-sm}"
  radio-hint-disabled:
    textColor: "{colors.otl-gray-300}"
  radio-size-small:
    size: 16px
    typography: "{typography.body-sm}"
  radio-size-medium:
    size: 20px
    typography: "{typography.body-md}"
  radio-size-large:
    size: 20px
    typography: "18px/28px"
  toggle:
    backgroundColor: "{colors.otl-gray-200}"
    width: 30px
    height: 20px
    rounded: "{rounded.full}"
  toggle-hover:
    backgroundColor: "{colors.otl-gray-300}"
  toggle-checked:
    backgroundColor: "{colors.bg-primary-600}"
  toggle-disabled:
    backgroundColor: "{colors.bg-washed}"
  toggle-checked-disabled:
    backgroundColor: "{colors.bg-primary-disabled}"
  toggle-thumb:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.full}"
  toggle-size-small:
    width: 24px
    height: 16px
  toggle-size-medium:
    width: 30px
    height: 20px
  toggle-size-large:
    width: 36px
    height: 24px

  # Feedback
  callout-info:
    backgroundColor: "{colors.bg-primary-50}"
    textColor: "{colors.txt-primary}"
    typography: "{typography.body-sm}"
    fontWeight: 600
    padding: "{spacing.3}"
    rounded: "{rounded.md}"
  callout-success:
    backgroundColor: "{colors.bg-success-50}"
    textColor: "{colors.txt-success}"
    typography: "{typography.body-sm}"
    fontWeight: 600
    padding: "{spacing.3}"
    rounded: "{rounded.md}"
  callout-warning:
    backgroundColor: "{colors.bg-warning-50}"
    textColor: "{colors.txt-warning}"
    typography: "{typography.body-sm}"
    fontWeight: 600
    padding: "{spacing.3}"
    rounded: "{rounded.md}"
  callout-danger:
    backgroundColor: "{colors.bg-danger-50}"
    textColor: "{colors.txt-danger}"
    typography: "{typography.body-sm}"
    fontWeight: 600
    padding: "{spacing.3}"
    rounded: "{rounded.md}"
  callout-description:
    textColor: "{colors.txt-black-900}"
    typography: "{typography.body-sm}"
    fontWeight: 400
  toast:
    backgroundColor: "{colors.bg-dialog-active}"
    borderColor: "{colors.bg-washed-active}"
    padding: "{spacing.3}"
    rounded: "{rounded.md}"
  toast-title-message:
    textColor: "{colors.txt-black-700}"
    typography: "{typography.body-sm}"
    fontWeight: 600
  toast-title-success:
    textColor: "{colors.txt-success}"
    typography: "{typography.body-sm}"
    fontWeight: 600
  toast-title-info:
    textColor: "{colors.txt-primary}"
    typography: "{typography.body-sm}"
    fontWeight: 600
  toast-title-warning:
    textColor: "{colors.txt-warning}"
    typography: "{typography.body-sm}"
    fontWeight: 600
  toast-title-error:
    textColor: "{colors.txt-danger}"
    typography: "{typography.body-sm}"
    fontWeight: 600
  toast-description:
    textColor: "{colors.txt-black-700}"
    typography: "{typography.body-sm}"
  toast-progress-message:
    backgroundColor: "{colors.bg-washed}"
    height: 4px
  toast-progress-success:
    backgroundColor: "{colors.txt-success}"
    height: 4px
  toast-progress-info:
    backgroundColor: "{colors.txt-primary}"
    height: 4px
  toast-progress-warning:
    backgroundColor: "{colors.txt-warning}"
    height: 4px
  toast-progress-error:
    backgroundColor: "{colors.txt-danger}"
    height: 4px
  tag-default:
    backgroundColor: "{colors.bg-washed}"
    textColor: "{colors.txt-black-500}"
    borderColor: "#52525B33"
    typography: "{typography.body-sm}"
    fontWeight: 500
    padding: "4px 8px"
    height: 28px
    rounded: "{rounded.md}"
  tag-primary:
    backgroundColor: "{colors.bg-primary-50}"
    textColor: "{colors.txt-primary}"
    borderColor: "#2563EB33"
    typography: "{typography.body-sm}"
    fontWeight: 500
    padding: "4px 8px"
    height: 28px
    rounded: "{rounded.md}"
  tag-success:
    backgroundColor: "{colors.bg-success-50}"
    textColor: "{colors.txt-success}"
    borderColor: "#15803D33"
    typography: "{typography.body-sm}"
    fontWeight: 500
    padding: "4px 8px"
    height: 28px
    rounded: "{rounded.md}"
  tag-danger:
    backgroundColor: "{colors.bg-danger-50}"
    textColor: "{colors.txt-danger}"
    borderColor: "#DC262633"
    typography: "{typography.body-sm}"
    fontWeight: 500
    padding: "4px 8px"
    height: 28px
    rounded: "{rounded.md}"
  tag-warning:
    backgroundColor: "{colors.bg-warning-50}"
    textColor: "{colors.txt-warning}"
    borderColor: "#A1620733"
    typography: "{typography.body-sm}"
    fontWeight: 500
    padding: "4px 8px"
    height: 28px
    rounded: "{rounded.md}"
  tag-size-small:
    typography: "{typography.body-xs}"
    padding: "2px 8px"
    height: 22px
  tag-size-medium:
    typography: "{typography.body-sm}"
    padding: "4px 8px"
    height: 28px
  tag-size-large:
    typography: "{typography.body-md}"
    padding: "4px 10px"
    height: 32px
  tag-mode-default:
    rounded: "{rounded.md}"
  tag-mode-pill:
    rounded: "{rounded.full}"
  tooltip:
    backgroundColor: "{colors.bg-black-900}"
    textColor: "{colors.txt-white}"
    typography: "12px/16px"
    padding: "8px 12px"
    rounded: "{rounded.sm}"

  # Navigation
  breadcrumb:
    textColor: "{colors.txt-black-500}"
    typography: "{typography.body-sm}"
    fontWeight: 500
  breadcrumb-hover:
    textColor: "{colors.txt-black-900}"
  breadcrumb-active:
    textColor: "{colors.txt-black-900}"
  breadcrumb-fill:
    backgroundColor: "{colors.bg-washed}"
    textColor: "{colors.txt-black-500}"
    padding: "4px 12px"
    rounded: "{rounded.md}"
  breadcrumb-separator:
    textColor: "{colors.bg-black-400}"
    size: 24px
  pagination-item:
    textColor: "{colors.txt-black-700}"
    typography: "{typography.body-md}"
    size: 40px
    rounded: "{rounded.md}"
  pagination-item-active:
    backgroundColor: "{colors.bg-washed-active}"
    textColor: "{colors.txt-black-700}"
  tabs-line:
    textColor: "{colors.txt-black-500}"
    typography: "{typography.body-sm}"
    fontWeight: 500
    padding: "6px 10px"
    rounded: "{rounded.md}"
  tabs-line-active:
    textColor: "{colors.txt-black-900}"
  tabs-line-indicator:
    backgroundColor: "{colors.primary-600}"
    height: 2px
  tabs-pill:
    textColor: "{colors.txt-black-500}"
    typography: "{typography.body-sm}"
    fontWeight: 500
    padding: "6px 10px"
    rounded: "{rounded.full}"
  tabs-pill-active:
    backgroundColor: "{colors.bg-washed-active}"
    textColor: "{colors.txt-black-900}"
  tabs-list-enclosed:
    backgroundColor: "{colors.bg-washed}"
    padding: "4px 0px"
    rounded: "{rounded.md}"
  tabs-enclosed:
    textColor: "{colors.txt-black-500}"
    typography: "{typography.body-sm}"
    fontWeight: 500
    padding: "6px 10px"
    rounded: "{rounded.md}"
  tabs-enclosed-active:
    backgroundColor: "{colors.bg-dialog-active}"
    textColor: "{colors.txt-black-900}"
    borderColor: "{colors.otl-gray-200}"
  tabs-size-small:
    typography: "{typography.body-sm}"
    padding: "6px 10px"
  tabs-size-medium:
    typography: "{typography.body-md}"
    padding: "8px 12px"

  # Data display
  accordion:
    backgroundColor: "{colors.bg-white}"
    borderColor: "{colors.otl-gray-200}"
  accordion-trigger:
    textColor: "{colors.txt-black-700}"
    typography: "16px/16px"
    fontWeight: 500
    padding: "16px 0px"
  accordion-trigger-hover:
    textColor: "{colors.txt-black-900}"
  accordion-trigger-disabled:
    textColor: "{colors.txt-black-disabled}"
  accordion-content:
    textColor: "{colors.txt-black-700}"
    typography: "{typography.body-sm}"
    fontWeight: 400
  summary-list:
    borderColor: "{colors.otl-gray-200}"
    typography: "{typography.body-sm}"
    fontWeight: 500
  summary-list-title:
    textColor: "{colors.txt-black-900}"
    typography: "{typography.body-xl}"
    fontWeight: 600
  summary-list-term:
    textColor: "{colors.txt-black-500}"
    padding: "12px 12px 12px 0px"
  summary-list-detail:
    textColor: "{colors.txt-black-900}"
    padding: "12px 12px 12px 0px"
  table-header:
    textColor: "{colors.txt-black-500}"
    typography: "12px/16px"
    fontWeight: 500
    padding: "12px 12px 12px 0px"
  table-cell:
    textColor: "{colors.txt-black-900}"
    borderColor: "{colors.otl-gray-200}"
    typography: "14px/33.11px"
    padding: "6px 12px 6px 0px"
  skeleton-line:
    backgroundColor: "{colors.bg-black-100}"
    rounded: "{rounded.full}"
  skeleton-circle:
    backgroundColor: "{colors.bg-black-100}"
    rounded: "{rounded.full}"
  skeleton-block:
    backgroundColor: "{colors.bg-black-100}"
    rounded: "{rounded.md}"
  table-skeleton:
    backgroundColor: "{colors.bg-black-100}"
    rounded: "{rounded.full}"
  data-table-sort-active:
    textColor: "{colors.txt-primary}"
  data-table-header-expanded:
    borderColor: "{colors.otl-primary-300}"
  data-table-select-checked:
    backgroundColor: "{colors.primary-600}"

  # Overlays
  dialog:
    backgroundColor: "{colors.bg-white}"
    borderColor: "{colors.otl-gray-200}"
    rounded: "{rounded.lg}"
  dialog-overlay:
    backgroundColor: "#3F3F4699"
  dialog-title:
    textColor: "{colors.txt-black-900}"
    typography: "{typography.body-lg}"
    fontWeight: 600
  dialog-description:
    textColor: "{colors.txt-black-700}"
    typography: "{typography.body-sm}"
    fontWeight: 400
  dialog-icon-primary:
    textColor: "{colors.txt-primary}"
    size: 42px
  dialog-icon-success:
    textColor: "{colors.txt-success}"
    size: 42px
  dialog-icon-warning:
    textColor: "{colors.txt-warning}"
    size: 42px
  dialog-icon-danger:
    textColor: "{colors.txt-danger}"
    size: 42px
  dropdown:
    backgroundColor: "{colors.bg-dialog}"
    borderColor: "{colors.otl-gray-200}"
    padding: 5px
    rounded: "{rounded.md}"
  dropdown-item:
    textColor: "{colors.txt-black-700}"
    typography: "{typography.body-sm}"
    fontWeight: 500
    padding: "6px 10px"
    rounded: "{rounded.xs}"
  dropdown-item-hover:
    backgroundColor: "{colors.bg-washed-active}"
    textColor: "{colors.txt-black-900}"
  dropdown-item-danger:
    textColor: "{colors.txt-danger}"
  dropdown-item-danger-hover:
    backgroundColor: "{colors.bg-danger-50}"
    textColor: "{colors.txt-danger}"
  select-outline:
    backgroundColor: "{colors.bg-white}"
    textColor: "{colors.txt-black-900}"
    borderColor: "{colors.otl-gray-200}"
    typography: "{typography.body-sm}"
    padding: "6px 10px"
    rounded: "{rounded.md}"
  select-outline-hover:
    backgroundColor: "{colors.bg-white-hover}"
    textColor: "{colors.txt-black-900}"
    borderColor: "{colors.otl-gray-300}"
  select-ghost:
    textColor: "{colors.txt-black-900}"
    typography: "{typography.body-sm}"
    padding: "6px 10px"
    rounded: "{rounded.md}"
  select-ghost-hover:
    backgroundColor: "{colors.bg-white-hover}"
    textColor: "{colors.txt-black-900}"
  select-disabled:
    backgroundColor: "{colors.bg-white-disabled}"
    textColor: "{colors.txt-black-disabled}"
  select-size-small:
    typography: "{typography.body-sm}"
    padding: "6px 10px"
  select-size-medium:
    typography: "{typography.body-md}"
    padding: "8px 12px"
  select-size-large:
    typography: "{typography.body-lg}"
    padding: "10px 16px"
  select-label:
    textColor: "{colors.txt-black-500}"
  select-counter:
    backgroundColor: "{colors.primary-600}"
    textColor: "{colors.white}"
    rounded: "{rounded.full}"
  select-content:
    backgroundColor: "{colors.bg-dialog}"
    borderColor: "{colors.otl-gray-200}"
    padding: "4px 0px"
    rounded: "{rounded.md}"
  select-item:
    textColor: "{colors.txt-black-700}"
    typography: "{typography.body-xs}"
    fontWeight: 500
    padding: "6px 38px 6px 10px"
    rounded: "{rounded.xs}"
  select-item-hover:
    backgroundColor: "{colors.bg-washed}"
    textColor: "{colors.txt-black-700}"
  select-item-disabled:
    backgroundColor: "{colors.bg-white-disabled}"
    textColor: "{colors.txt-black-disabled}"
  select-group-label:
    textColor: "{colors.gray-400}"
    typography: "{typography.body-xs}"
    fontWeight: 600
    padding: "6px 10px"

  # Page-level
  skiplink:
    backgroundColor: "{colors.bg-white}"
    textColor: "{colors.txt-primary}"
    borderColor: "{colors.otl-primary-200}"
    typography: "{typography.body-sm}"
    fontWeight: 500
    padding: "6px 10px"
    rounded: "{rounded.md}"
  masthead:
    backgroundColor: "{colors.bg-washed}"
    textColor: "{colors.txt-black-700}"
    typography: "{typography.body-sm}"
    padding: "8px 18px"
  masthead-trigger:
    backgroundColor: "{colors.otl-gray-200}"
    textColor: "{colors.txt-primary}"
    padding: "{spacing.1}"
    rounded: "{rounded.md}"
  masthead-heading:
    textColor: "{colors.txt-black-900}"
    typography: "{typography.body-sm}"
    fontWeight: 500
  navbar:
    backgroundColor: "{colors.bg-white}"
    borderColor: "{colors.otl-gray-200}"
    height: 64px
    padding: "0px 24px"
  navbar-logo-title:
    textColor: "{colors.txt-black-900}"
    typography: "{typography.body-lg}"
    fontWeight: 600
  navbar-menu-item:
    textColor: "{colors.txt-black-700}"
    typography: "{typography.body-sm}"
    fontWeight: 500
    padding: "6px 10px"
    rounded: "{rounded.md}"
  navbar-menu-item-hover:
    backgroundColor: "{colors.bg-washed}"
    textColor: "{colors.txt-black-700}"
  navbar-dropdown:
    backgroundColor: "{colors.bg-white}"
    padding: "{spacing.1.5}"
    rounded: "{rounded.md}"
  navbar-mobile-menu:
    backgroundColor: "{colors.bg-dialog}"
    textColor: "{colors.txt-black-900}"
    borderColor: "{colors.otl-gray-200}"
    padding: "{spacing.3}"
  navbar-overlay:
    backgroundColor: "#3F3F4699"
  footer:
    backgroundColor: "{colors.bg-gray-50}"
    borderColor: "{colors.otl-gray-200}"
    typography: "{typography.body-sm}"
  footer-logo-title:
    textColor: "{colors.txt-black-900}"
    typography: "{typography.body-md}"
    fontWeight: 600
  footer-group-title:
    textColor: "{colors.txt-black-900}"
    fontWeight: 600
  footer-link:
    textColor: "{colors.txt-black-700}"
  footer-link-hover:
    textColor: "{colors.txt-black-900}"
  announce-bar:
    textColor: "{colors.txt-black-700}"
    borderColor: "{colors.otl-gray-200}"
    typography: "{typography.body-sm}"
    padding: "8px 0px"
  cookie-banner:
    backgroundColor: "{colors.bg-white}"
    borderColor: "{colors.otl-gray-200}"
    padding: "{spacing.4.5}"
    rounded: "{rounded.lg}"
  cookie-banner-title:
    textColor: "{colors.txt-black-900}"
    typography: "{typography.body-md}"
    fontWeight: 600
  cookie-banner-description:
    textColor: "{colors.txt-black-900}"
    typography: "{typography.body-sm}"
    fontWeight: 400
---

# MYDS — Malaysian Government Design System

> **Unofficial.** Written independently from the public MYDS source. Not made or endorsed by GovTech Malaysia or Kementerian Digital.
>
> **For official Malaysian government services only.** The Masthead, the Malaysia flag and the Jata Negara tell citizens that the Government runs a site. If you aren't building an official government service, don't use this file, and never show those marks.
>
> The text of this file is © 2026 Amer Fathullah Nuaim Zakaria, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The licence covers the writing only, not MYDS's values, the quotes from its design guideline, or the national marks.

This file describes MYDS **as built**: the Tailwind 4 preset in `packages/style` (`@amerfathullah/myds-style`) and the React library in `packages/react` (`@amerfathullah/myds-react`). It was checked against `@amerfathullah/myds-react` and `@amerfathullah/myds-style` 2.0.1. The design guideline in `apps/docs/content/docs/design` is used where code says nothing. Where the two disagree, this file prints what the code renders and lists the guideline's value under [Known Gaps](#known-gaps). Terms such as _semantic token_, _off-label pairing_, _page frame_, _variant_ and _state_ are defined in [`CONTEXT.md`](CONTEXT.md).

Install both with `npm install @amerfathullah/myds-react @amerfathullah/myds-style`, or only `@amerfathullah/myds-style` without React. From 2.0.0 they continue `@govtechmy/myds-*` 1.x under these names.

- **Requirements.** The React library supports React 18 and 19. The CSS import needs Tailwind 4 (`tailwindcss` ^4, an optional peer dependency); `full.css` needs no Tailwind. Either way the styles need Safari 16.4, Chrome 111, Firefox 128 or newer, because `full.css` is built with Tailwind 4 too.
- **With Tailwind 4**, import MYDS once, after Tailwind. The import loads no fonts, so load Inter and Poppins yourself. With the React library, also point `@source` at it: Tailwind doesn't scan `node_modules`, so without that line the components render unstyled. The templates' stylesheet does all three:

  ```css
  @import url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Poppins:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&display=swap");

  @import "tailwindcss";
  @import "@amerfathullah/myds-style";

  /* Path from this stylesheet to node_modules */
  @source "../node_modules/@amerfathullah/myds-react/dist";
  ```

- **Without Tailwind**, import the precompiled `@amerfathullah/myds-style/full.css`: Tailwind's preflight, the fonts, MYDS and every class the React library uses.
- **`full.css` adds rules the import lacks.** It sets `scroll-behavior: smooth` and `scroll-padding-top: 65px` on `html`, which clears the sticky Navbar. It also hides the outline when focus isn't `:focus-visible`, and sets `text-underline-position: from-font` on the `underline` class. With the import, add `html { scroll-behavior: smooth; scroll-padding-top: 65px; }` to your own stylesheet.

## Overview

MYDS is a civic utility, not a brand campaign. It exists so that a citizen moving between government services meets the same calm, predictable interface every time, and so that every agency builds to the same accessibility bar. The design guideline names the values behind it (transparency, inclusivity, efficiency, consistency, and accessibility to WCAG), and the built system expresses them through restraint.

The canvas is white and the text near-black. There is one primary colour, blue, and it marks what you can act on or what is selected, never decoration. Headings are set in Poppins and body text in Inter, and weights stop at Semibold. Danger, success and warning appear only when something has a status. The same semantic tokens drive a light and a dark theme. Agencies do not recolour the system: their identity enters only through the logo slots in the Navbar and Footer, inside a fixed page frame whose first visible part is always the Masthead and the Malaysia flag.

**Key Characteristics:**

1. A white canvas with near-black text: `bg-white` surfaces, `txt-black-900` for primary text.
2. Blue primary marks action and selection: primary buttons, links, checked controls, the active tab and the focus ring. It is not decoration.
3. Poppins headings (`font-heading` with `text-heading-*`) over an Inter body (`font-body` with `text-body-*`). Weights stop at Semibold 600; no component uses `font-bold`.
4. Danger, success and warning convey status only: callouts, tags, validation and toasts.
5. Light and dark themes come from semantic tokens plus the `.dark` class.
6. Keyboard focus shows as a visible ring, mostly `fr-primary`. An invalid date or time field wears an `fr-danger` ring while it isn't focused.
7. A fixed page frame: SkipLink → Masthead (Malaysia flag) → Navbar (agency logo) … Footer (agency logo).
8. The 12-8-4 grid: 12 columns on desktop, 8 on tablet, 4 on mobile.

## Colors

The front matter records the **light theme**. `colors:` holds two layers. The primitive colours are literal hex values (`primary-600: "#2563EB"`). The semantic tokens alias a primitive under their verbatim MYDS names (`bg-primary-600: "{colors.primary-600}"`), exactly as `light.css` maps them. A token with alpha can't be an alias, so those are 8-digit hex literals: `bg-white-disabled` is `gray-100` @ 40%, `#F4F4F566`. `white-disabled` is the preset's white @ 40%, which disabled fill buttons use for their label.

There is no `primary` key. The preset's `primary` family has only numbered steps, so `bg-primary` doesn't exist and inventing it would document a class nobody can write.

The design guideline's colour pages are images only, so every value here comes from `packages/style/styles/theme/{color,light,dark}.css`. Usage notes come from how the components actually use each token.

### Theming

- **Theme switching is only a variable swap.** Semantic tokens are CSS variables defined on `:root` (`light.css`) and redefined under `.dark` (`dark.css`). Anything styled with a semantic token re-themes; anything styled with a primitive stays the same colour in both themes. `.dark` re-themes any subtree it is put on, but no class switches a subtree inside it back to light.
- **Don't use `dark:`.** No component does. The preset leaves Tailwind 4's `dark` variant at its default, `prefers-color-scheme: dark`, so a `dark:` class follows the viewer's system setting, not the `.dark` class that switches MYDS. Use semantic tokens, which follow `.dark` on their own.
- **Class rule: `<utility>-<token>`.** The preset exposes each semantic token as a Tailwind colour (the theme variable `--color-bg-white` makes `bg-bg-white`), so the token name follows the utility: `bg-bg-white`, `text-txt-black-900`, `border-otl-gray-200`, `ring-fr-primary`. The doubled prefix is correct.
- **Any utility takes any token.** The prefix names the token's intended _visual role_: `bg` for surfaces, `txt` for glyphs and icons, `otl` for lines, edges and rings, `fr` for focus. The library sometimes pairs a token with an unexpected utility. Most of these are on-role, because the pixel really is that role: `bg-otl-divider` on a 1px divider, `stroke-txt-primary` on an icon, `ring-otl-primary-200` on a ring. A border coloured to match its own fill is part of that surface, as on the tooltip (`border-bg-black-900`) and disabled fill buttons. A few are off-label pairings, which are documented as built but not recommended: the toast progress bar uses `bg-txt-{status}`, the toast border is `border-bg-washed-active`, the toggle track is `bg-otl-gray-200`, the Masthead trigger is filled `bg-otl-gray-200` below `sm:`, the breadcrumb separator and the `/` between the calendar's month and year are `text-bg-black-400`, and a disabled radio hint is `text-otl-gray-300`.
- **Inversion rule.** In the dark theme, `bg-{family}-N` maps to primitive step 1000−N (50 ↔ 950). Step 500 is the pivot and is **theme-invariant**: `bg-{black,primary,danger,success,warning}-500` resolve to the same colour in both themes.
- The preset clears Tailwind's colours (`--color-*: initial`) before adding its own, so Tailwind's default palette (`blue-500`, `red-600`, …) is unavailable. Only the MYDS primitives and semantic tokens exist, plus `current`, `inherit` and `transparent`.
- **Base layer.** The preset keeps three Tailwind 3 defaults: a border with no colour class is `gray-200`, an input or textarea placeholder is `gray-400`, and enabled buttons get `cursor: pointer`. The first two are primitives, so they don't re-theme: a bare `border` stays #E4E4E7 in dark, where `otl-gray-200` turns #27272A. Give every border an `otl-*` class, and every placeholder `placeholder:text-txt-black-500` as the library's input, textarea and search bar do.

### Primitives

Five scales, plus `white` and `black`. `gray` is Tailwind 3's _zinc_ with its own 500 and two extra steps (850, 930). `primary` is Tailwind 3's _blue_ with its own 200–500. `danger`, `success` and `warning` are Tailwind 3's _red_, _green_ and _yellow_, apart from `success-300`. Tailwind 4 redefined these palettes in OKLCH, so they no longer match: Tailwind 4's `blue-600` is #155DFC, not #2563EB.

| Step | gray    | primary | danger  | success | warning |
| ---- | ------- | ------- | ------- | ------- | ------- |
| 50   | #FAFAFA | #EFF6FF | #FEF2F2 | #F0FDF4 | #FEFCE8 |
| 100  | #F4F4F5 | #DBEAFE | #FEE2E2 | #DCFCE7 | #FEF9C3 |
| 200  | #E4E4E7 | #C2D5FF | #FECACA | #BBF7D0 | #FEF08A |
| 300  | #D4D4D8 | #96B7FF | #FCA5A5 | #83DAA3 | #FDE047 |
| 400  | #A1A1AA | #6394FF | #F87171 | #4ADE80 | #FACC15 |
| 500  | #6B6B74 | #3A75F6 | #EF4444 | #22C55E | #EAB308 |
| 600  | #52525B | #2563EB | #DC2626 | #16A34A | #CA8A04 |
| 700  | #3F3F46 | #1D4ED8 | #B91C1C | #15803D | #A16207 |
| 800  | #27272A | #1E40AF | #991B1B | #166534 | #854D0E |
| 850  | #1D1D21 | —       | —       | —       | —       |
| 900  | #18181B | #1E3A8A | #7F1D1D | #14532D | #713F12 |
| 930  | #161619 | —       | —       | —       | —       |
| 950  | #09090B | #172554 | #450A0A | #052E16 | #422006 |

`white` #FFFFFF. `black` #000000 exists in `color.css`, but no token maps to it and the preset doesn't expose it.

### Background (`bg-*`)

- **Surfaces:** `bg-white` is the page and card surface. `bg-white-hover` is its hover, and `bg-white-disabled` (`gray-100` @ 40%) is its disabled fill. `bg-washed` is the recessed surface (Masthead, enclosed tabs, disabled inputs, tag default), and `bg-gray-50` is the Footer. `bg-dialog` fills menus, popovers and select content. `bg-contrast` is unused by components.
- **`-active` tokens only differ in dark.** `bg-washed-active` equals `bg-washed`, and `bg-dialog-active` equals `bg-dialog`, in the light theme. They separate only in dark, so a selected pill tab or pagination item looks the same as its surface in light.
- **`bg-black-*`** is a neutral ramp that inverts (`bg-black-900` is `gray-900` in light and `white` in dark). The tooltip uses `bg-black-900`, and Skeleton shimmers between `bg-black-100` and `bg-black-300`.
- **`bg-{primary,danger,success,warning}-*`** are the tinted status fills. Components use the 50 step for callouts, tags, and outline and ghost hovers. `bg-primary-100` and `bg-primary-200` are the date-range fill and its hover, and the toggle track uses `bg-primary-600` when checked.
- **`bg-{status}-disabled`** are opaque: step 200 in light, step 950 in dark.

### Text (`txt-*`)

- `txt-black-900` is primary text, `txt-black-700` is body and control text, and `txt-black-500` is secondary text, placeholders and icons.
- `txt-primary`, `txt-danger`, `txt-success` and `txt-warning` colour links, status titles and status icons.
- **`txt-white` means "text on a filled surface", not literal white.** It flips to `gray-900` in dark, because the filled surface it sits on (tooltip `bg-black-900`) flips to white.
- `txt-*-disabled` are the matching colour @ 40%.

### Outline (`otl-*`)

- `otl-gray-200` is the default border and divider for inputs, cards, dialogs, tables and the page frame. `otl-gray-300` is its hover.
- `otl-divider` is the separator inside menus and select content.
- `otl-primary-300` is the focused or expanded border, and `otl-primary-200` the primary-outline button border. `otl-danger-300` is the invalid border, and `otl-danger-200` the danger-outline button border.
- `otl-*-disabled` are the matching colour @ 40%. `otl-warning-300` resolves to the **danger** scale; see Known Gaps.

### Focus ring (`fr-*`)

- `fr-primary` (`primary-300` @ 40%) is the focus ring on most focusable controls, danger variants included. The search bar and the active Input OTP slot use an `otl-primary-200` ring instead, and a table cell a 3px `primary-600` @ 20% outline.
- `fr-danger` (`danger-300` @ 40%) is used only on an invalid date or time field, and only while it isn't focused: focus switches it to `fr-primary`.

### Dark theme

The dark theme redefines every semantic token. This table is generated from `light.css` and `dark.css`; alpha is shown as a percentage and as 8-digit hex.

| Token                  | Light                             | Dark                              |
| ---------------------- | --------------------------------- | --------------------------------- |
| `bg-white`             | `white` #FFFFFF                   | `gray-900` #18181B                |
| `bg-white-hover`       | `gray-50` #FAFAFA                 | `gray-800` #27272A                |
| `bg-white-disabled`    | `gray-100` @ 40% (`#F4F4F566`)    | `gray-800` @ 40% (`#27272A66`)    |
| `bg-washed`            | `gray-100` #F4F4F5                | `gray-850` #1D1D21                |
| `bg-washed-active`     | `gray-100` #F4F4F5                | `gray-800` #27272A                |
| `bg-contrast`          | `white` #FFFFFF                   | `gray-930` #161619                |
| `bg-dialog`            | `white` #FFFFFF                   | `gray-850` #1D1D21                |
| `bg-dialog-active`     | `white` #FFFFFF                   | `gray-800` #27272A                |
| `bg-black-900`         | `gray-900` #18181B                | `white` #FFFFFF                   |
| `bg-black-800`         | `gray-800` #27272A                | `gray-200` #E4E4E7                |
| `bg-black-700`         | `gray-700` #3F3F46                | `gray-300` #D4D4D8                |
| `bg-black-500`         | `gray-500` #6B6B74                | `gray-500` #6B6B74                |
| `bg-black-400`         | `gray-400` #A1A1AA                | `gray-600` #52525B                |
| `bg-black-300`         | `gray-300` #D4D4D8                | `gray-700` #3F3F46                |
| `bg-black-200`         | `gray-200` #E4E4E7                | `gray-800` #27272A                |
| `bg-black-100`         | `gray-100` #F4F4F5                | `gray-900` #18181B                |
| `bg-black-50`          | `gray-50` #FAFAFA                 | `gray-950` #09090B                |
| `bg-black-disabled`    | `gray-900` @ 40% (`#18181B66`)    | `white` @ 40% (`#FFFFFF66`)       |
| `bg-gray-50`           | `gray-50` #FAFAFA                 | `gray-930` #161619                |
| `bg-primary-50`        | `primary-50` #EFF6FF              | `primary-950` #172554             |
| `bg-primary-100`       | `primary-100` #DBEAFE             | `primary-900` #1E3A8A             |
| `bg-primary-200`       | `primary-200` #C2D5FF             | `primary-800` #1E40AF             |
| `bg-primary-300`       | `primary-300` #96B7FF             | `primary-700` #1D4ED8             |
| `bg-primary-400`       | `primary-400` #6394FF             | `primary-600` #2563EB             |
| `bg-primary-500`       | `primary-500` #3A75F6             | `primary-500` #3A75F6             |
| `bg-primary-600`       | `primary-600` #2563EB             | `primary-400` #6394FF             |
| `bg-primary-700`       | `primary-700` #1D4ED8             | `primary-300` #96B7FF             |
| `bg-primary-800`       | `primary-800` #1E40AF             | `primary-200` #C2D5FF             |
| `bg-primary-900`       | `primary-900` #1E3A8A             | `primary-100` #DBEAFE             |
| `bg-primary-950`       | `primary-950` #172554             | `primary-50` #EFF6FF              |
| `bg-primary-disabled`  | `primary-200` #C2D5FF             | `primary-950` #172554             |
| `bg-danger-50`         | `danger-50` #FEF2F2               | `danger-950` #450A0A              |
| `bg-danger-100`        | `danger-100` #FEE2E2              | `danger-900` #7F1D1D              |
| `bg-danger-200`        | `danger-200` #FECACA              | `danger-800` #991B1B              |
| `bg-danger-300`        | `danger-300` #FCA5A5              | `danger-700` #B91C1C              |
| `bg-danger-400`        | `danger-400` #F87171              | `danger-600` #DC2626              |
| `bg-danger-500`        | `danger-500` #EF4444              | `danger-500` #EF4444              |
| `bg-danger-600`        | `danger-600` #DC2626              | `danger-400` #F87171              |
| `bg-danger-700`        | `danger-700` #B91C1C              | `danger-300` #FCA5A5              |
| `bg-danger-800`        | `danger-800` #991B1B              | `danger-200` #FECACA              |
| `bg-danger-900`        | `danger-900` #7F1D1D              | `danger-100` #FEE2E2              |
| `bg-danger-950`        | `danger-950` #450A0A              | `danger-50` #FEF2F2               |
| `bg-danger-disabled`   | `danger-200` #FECACA              | `danger-950` #450A0A              |
| `bg-success-50`        | `success-50` #F0FDF4              | `success-950` #052E16             |
| `bg-success-100`       | `success-100` #DCFCE7             | `success-900` #14532D             |
| `bg-success-200`       | `success-200` #BBF7D0             | `success-800` #166534             |
| `bg-success-300`       | `success-300` #83DAA3             | `success-700` #15803D             |
| `bg-success-400`       | `success-400` #4ADE80             | `success-600` #16A34A             |
| `bg-success-500`       | `success-500` #22C55E             | `success-500` #22C55E             |
| `bg-success-600`       | `success-600` #16A34A             | `success-400` #4ADE80             |
| `bg-success-700`       | `success-700` #15803D             | `success-300` #83DAA3             |
| `bg-success-800`       | `success-800` #166534             | `success-200` #BBF7D0             |
| `bg-success-900`       | `success-900` #14532D             | `success-100` #DCFCE7             |
| `bg-success-950`       | `success-950` #052E16             | `success-50` #F0FDF4              |
| `bg-success-disabled`  | `success-200` #BBF7D0             | `success-950` #052E16             |
| `bg-warning-50`        | `warning-50` #FEFCE8              | `warning-950` #422006             |
| `bg-warning-100`       | `warning-100` #FEF9C3             | `warning-900` #713F12             |
| `bg-warning-200`       | `warning-200` #FEF08A             | `warning-800` #854D0E             |
| `bg-warning-300`       | `warning-300` #FDE047             | `warning-700` #A16207             |
| `bg-warning-400`       | `warning-400` #FACC15             | `warning-600` #CA8A04             |
| `bg-warning-500`       | `warning-500` #EAB308             | `warning-500` #EAB308             |
| `bg-warning-600`       | `warning-600` #CA8A04             | `warning-400` #FACC15             |
| `bg-warning-700`       | `warning-700` #A16207             | `warning-300` #FDE047             |
| `bg-warning-800`       | `warning-800` #854D0E             | `warning-200` #FEF08A             |
| `bg-warning-900`       | `warning-900` #713F12             | `warning-100` #FEF9C3             |
| `bg-warning-950`       | `warning-950` #422006             | `warning-50` #FEFCE8              |
| `bg-warning-disabled`  | `warning-200` #FEF08A             | `warning-950` #422006             |
| `txt-white`            | `white` #FFFFFF                   | `gray-900` #18181B                |
| `txt-white-disabled`   | `white` @ 40% (`#FFFFFF66`)       | `gray-900` @ 40% (`#18181B66`)    |
| `txt-black-900`        | `gray-900` #18181B                | `white` #FFFFFF                   |
| `txt-black-700`        | `gray-700` #3F3F46                | `gray-300` #D4D4D8                |
| `txt-black-500`        | `gray-500` #6B6B74                | `gray-400` #A1A1AA                |
| `txt-black-disabled`   | `gray-600` @ 40% (`#52525B66`)    | `gray-400` @ 40% (`#A1A1AA66`)    |
| `txt-primary`          | `primary-600` #2563EB             | `primary-400` #6394FF             |
| `txt-primary-disabled` | `primary-600` @ 40% (`#2563EB66`) | `primary-400` @ 40% (`#6394FF66`) |
| `txt-danger`           | `danger-700` #B91C1C              | `danger-400` #F87171              |
| `txt-danger-disabled`  | `danger-600` @ 40% (`#DC262666`)  | `danger-400` @ 40% (`#F8717166`)  |
| `txt-success`          | `success-700` #15803D             | `success-500` #22C55E             |
| `txt-success-disabled` | `success-700` @ 40% (`#15803D66`) | `success-500` @ 40% (`#22C55E66`) |
| `txt-warning`          | `warning-700` #A16207             | `warning-500` #EAB308             |
| `txt-warning-disabled` | `warning-700` @ 40% (`#A1620766`) | `warning-500` @ 40% (`#EAB30866`) |
| `otl-divider`          | `gray-100` #F4F4F5                | `gray-850` #1D1D21                |
| `otl-gray-200`         | `gray-200` #E4E4E7                | `gray-800` #27272A                |
| `otl-gray-300`         | `gray-300` #D4D4D8                | `gray-700` #3F3F46                |
| `otl-primary-disabled` | `primary-200` @ 40% (`#C2D5FF66`) | `primary-800` @ 40% (`#1E40AF66`) |
| `otl-primary-200`      | `primary-200` #C2D5FF             | `primary-800` #1E40AF             |
| `otl-primary-300`      | `primary-300` #96B7FF             | `primary-700` #1D4ED8             |
| `otl-danger-disabled`  | `danger-200` @ 40% (`#FECACA66`)  | `danger-800` @ 40% (`#991B1B66`)  |
| `otl-danger-200`       | `danger-200` #FECACA              | `danger-800` #991B1B              |
| `otl-danger-300`       | `danger-300` #FCA5A5              | `danger-700` #B91C1C              |
| `otl-success-disabled` | `success-200` @ 40% (`#BBF7D066`) | `success-800` @ 40% (`#16653466`) |
| `otl-success-200`      | `success-200` #BBF7D0             | `success-800` #166534             |
| `otl-success-300`      | `success-300` #83DAA3             | `success-700` #15803D             |
| `otl-warning-disabled` | `warning-200` @ 40% (`#FEF08A66`) | `warning-800` @ 40% (`#854D0E66`) |
| `otl-warning-200`      | `warning-200` #FEF08A             | `warning-800` #854D0E             |
| `otl-warning-300`      | `danger-300` #FCA5A5              | `danger-700` #B91C1C              |
| `fr-primary`           | `primary-300` @ 40% (`#96B7FF66`) | `primary-700` @ 40% (`#1D4ED866`) |
| `fr-danger`            | `danger-300` @ 40% (`#FCA5A566`)  | `danger-700` @ 40% (`#B91C1C66`)  |

## Typography

- **Families.** `font-body` is Inter and `font-heading` is Poppins, each followed by Tailwind 3's sans stack (`ui-sans-serif, system-ui, sans-serif` and the emoji fonts), which the preset keeps. `font-mono` (Roboto Mono) is declared but never loaded. Both Inter (variable 100–900) and Poppins (400, 500, 600) load from Google Fonts in the precompiled `full.css` (`input.tailwind.css`); with the Tailwind import, load them yourself, as in the stylesheet at the top of this file. Neither entry applies them: an app adds `font-body` to its root and `font-heading` to its headings. The guideline says Poppins is for page headers and section titles, and Inter for everything else.
- **Scale.** `typography:` copies the preset's `--text-*` theme variables exactly: six heading sizes and five body sizes, each a font size and line height, under the same names as the classes (`{typography.body-sm}` is `text-body-sm`). The bare `text` class (a utility the preset defines) equals `body-sm`, 14/20. The tokens carry no family or weight: MYDS sets those with separate classes.
- **Which size where.** `heading-md` (36/44) is `<h1>`, `heading-sm` is `<h2>`, `heading-xs` is `<h3>` and `heading-2xs` is `<h4>`. `heading-xl` and `heading-lg` are display sizes. No component uses a `heading-*` size. Components use `body-sm` for small controls, `body-md` for medium and `body-lg` for large, and `body-lg` also sets the dialog title.
- **Weights.** Regular 400, Medium 500 and Semibold 600 (`font-normal`, `font-medium`, `font-semibold`). Controls, tags, breadcrumbs and menu items are Medium; titles are Semibold. Component entries carry the weight as a `fontWeight` number next to `typography`.
- **Off-scale sizes in the library.** Some components use Tailwind's default sizes instead of the body scale. Where the rendered size and line height match a MYDS token, the entry references it (`text-sm` = `body-sm`, `text-base` = `body-md`). Otherwise the entry carries a literal `"size/line-height"` value and the component's prose flags it: `text-xs` 12/16, `text-lg` 18/28, `text-4xl` 36/40, and a few `leading-*` overrides. New UI uses the MYDS scale.

## Layout

### Grid and breakpoints

MYDS lays pages out on the **12-8-4 grid**: 12 columns on desktop, 8 on tablet, 4 on mobile. The gutter and page edge are 24px on desktop and tablet and 18px on mobile, and content stops at 1280px.

The preset does not define its own breakpoints, so Tailwind's defaults are in effect: `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536. The guideline's tiers map onto them exactly:

| Tier    | Width      | Prefix |
| ------- | ---------- | ------ |
| Mobile  | ≤ 767px    | none   |
| Tablet  | 768–1023px | `md:`  |
| Desktop | ≥ 1024px   | `lg:`  |

A page container and grid built from existing classes (the page-level components already use this container):

```html
<div class="mx-auto max-w-screen-xl px-4.5 md:px-6">
  <div class="grid grid-cols-4 gap-4.5 md:grid-cols-8 md:gap-6 lg:grid-cols-12">
    …
  </div>
</div>
```

For long-form reading, the guideline sets article text at 640px wide and images and interactive charts at 740px. No component builds these widths.

### Spacing

`spacing:` uses Tailwind's step names, so `{spacing.4.5}` is the `4.5` in `px-4.5`. The scale is Tailwind's 4px scale. Tailwind multiplies the 4px by the step number, so the two steps MYDS needs beyond the common ones, `4.5` (18px, the mobile gutter) and `10.5` (42px, the alert-dialog icon), need no token.

The guideline's ten steps (4, 8, 12, 16, 20, 24, 32, 40, 48 and 64px) are the layout rhythm. It uses 8px between buttons in a group and between a field and its label, 24px between sub-sections and cards, and 32px between main sections. The half steps (2, 6, 10, 14 and 18px) are for component internals such as button and tag padding.

### Page frame

The page-level components form a fixed frame around every page, in this order: SkipLink → Masthead → Navbar … content … Footer. Their responsive behaviour as built:

- **Masthead** switches from a stacked to a two-column explainer at `sm:` (640), and widens its padding from 18px to 24px at `md:`.
- **Navbar** is 56px tall below `md:` and 64px from `md:` up. Its menu collapses into a mobile menu below `xl:` (1280), with a `gray-700` @ 60% overlay.
- **Footer** stacks SiteInfo and each link group full width below `lg:`, with a group's links in 2 columns, then 4 from `md:`. From `lg:` it is a 12-column grid capped at 1280px: SiteInfo takes columns 1–3 and each group 2 columns, its links in a single column.
- **AnnounceBar** keeps an 18px side margin below `md:` and 24px from `md:` up.
- **CookieBanner** is fixed to the bottom-right corner, full width up to 500px, with no margin and 18px padding on mobile. From `sm:` up it sits 16px from the bottom and right edges with 24px padding.

## Elevation & Depth

MYDS is mostly flat. Depth comes from borders (`otl-gray-200`) and recessed `bg-washed` surfaces first, and from shadow only for things that sit above the page. There are four levels. "No shadow" is the default, and the other three are classes:

| Level        | Class                 | Value                                                                  | Used by                                                                                                                     |
| ------------ | --------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| None         | (no class)            | —                                                                      | Cards, callouts, accordion, tables, dialog                                                                                  |
| Button       | `shadow-button`       | `0px 1px 3px 0px rgba(0,0,0,0.07)`                                     | Outline and fill buttons, select trigger (outline), inputs such as date field, search bar and pill, checkbox, radio, Navbar |
| Card         | `shadow-card`         | `0px 2px 6px 0px rgba(0,0,0,0.05), 0px 6px 24px 0px rgba(0,0,0,0.05)`  | Toast, CookieBanner                                                                                                         |
| Context menu | `shadow-context-menu` | `0px 2px 6px 0px rgba(0,0,0,0.05), 0px 12px 50px 0px rgba(0,0,0,0.10)` | Dropdown, select content, tooltip, popover, Navbar dropdown and mobile menu, search results, SkipLink when focused          |

- The shadows are pure black at a fixed alpha and **don't change in the dark theme**.
- The preset **replaces** Tailwind's shadow scales (`--shadow-*` and `--inset-shadow-*`), so Tailwind's own `shadow-2xs` … `shadow-2xl`, bare `shadow` and `inset-shadow-*` generate nothing. `shadow-none` is Tailwind's and removes a shadow. The dialog asks for `shadow-lg` and so renders with no shadow.
- Tailwind's `drop-shadow-*` and `text-shadow-*` are not cleared, so they still generate Tailwind's own shadows, which aren't MYDS's. Don't use them.
- Overlays behind modal surfaces are `gray-700` @ 60% (`#3F3F4699`): the dialog overlay and the Navbar's mobile-menu overlay.

## Shapes

`rounded:` is the preset's radius scale. Bare `rounded` is `md` (8px).

| Token  | Value  | Where the guideline uses it      | Where the library uses it                                                                                 |
| ------ | ------ | -------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `xs`   | 4px    | Context-menu item                | Small checkbox, dropdown and select items                                                                 |
| `sm`   | 6px    | Small button                     | Pill, tooltip, small search bar                                                                           |
| `md`   | 8px    | Button, CTA, context menu        | Every button size, inputs, select, dropdown, callout, toast, tag (default mode), tabs, skeleton (`block`) |
| `lg`   | 12px   | Content card                     | Dialog, CookieBanner                                                                                      |
| `xl`   | 14px   | Context menu with a search field | —                                                                                                         |
| `full` | 9999px | —                                | Tag (pill mode), toggle, radio, large search bar, counters, pill tabs, skeleton (`line`, `circle`)        |

- Checkbox medium and large use an off-scale 5px.
- The large search bar's results panel rounds only its bottom corners, with Tailwind's `rounded-b-2xl` (16px, off-scale). The small and medium panels use `rounded-b-sm` and `rounded-b-md`.

## Motion

Motion in MYDS is short and functional: the guideline says it should guide, not distract, and that every motion needs a purpose.

- **Durations.** `duration-200`, `duration-400` and `duration-600` are what the guideline calls short, medium and long. Tailwind takes any number of milliseconds, and components also use `duration-300`, `duration-500` and `duration-1000`.
- **Easing.** The preset defines no easing utilities. Components use Tailwind's `ease-in-out` (the accordion chevron and SkipLink); the `-slide-` animations below carry the CSS `ease-out` keyword in their own definitions.
- **Named animations**, which you reuse rather than write your own:

  | Class                                     | Keyframes                                        | Timing                                                                  |
  | ----------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------- |
  | `animate-slide-up` / `animate-slide-down` | translate Y from ±100% to 0                      | 300ms ease-out                                                          |
  | `animate-accordion-slide-down` / `-up`    | height 0 ↔ `--radix-accordion-content-height`   | 300ms ease-out                                                          |
  | `animate-collapsible-slide-down` / `-up`  | height 0 ↔ `--radix-collapsible-content-height` | 300ms ease-out                                                          |
  | `animate-shimmer`                         | background-position 0% → 200%                    | 1200ms linear, infinite (Skeleton)                                      |
  | `animate-expire`                          | width 100% → 0%                                  | 5s linear (toast progress bar; the toast sets the real duration inline) |

  `tw-animate-css` also defines `animate-accordion-down`/`-up`, `animate-collapsible-down`/`-up` and `animate-caret-blink`. The preset removes them, so they generate nothing; use the `-slide-` names above.

- **Enter and exit.** `tw-animate-css`, which the preset imports, supplies `animate-in`/`animate-out`, `fade-in-0`/`fade-out-0`, `zoom-in-95`/`zoom-out-95` and `slide-in-from-*`. Dropdown, select content and popover open and close with fade + zoom-95 + an 8px slide from the trigger side. The dialog fades and zooms from 95% while rising 2% of its height into the centre (`slide-in-from-bottom-[2%]`, reversed on close) over 200ms, and its overlay fades. Tooltip fades in over 200ms; the preset's `origin-tooltip-origin` sets its transform origin to the one Radix computes.
- **Press.** Buttons move down by half a pixel while pressed (`active:translate-y-[0.5px]`).
- **Reduced motion.** Under `prefers-reduced-motion`, Skeleton and the Masthead panel stop animating (`motion-reduce:animate-none`), and Navbar's menu links and dropdown chevron drop their transitions (`motion-reduce:transition-none`). Every other animation still runs.
- **Scrolling.** `full.css` sets `scroll-behavior: smooth` with `scroll-padding-top: 65px`, which clears the sticky Navbar. The Tailwind import sets neither; the setup at the top of this file gives the rule to add.

## Iconography

- **Source.** Import `<Name>Icon` components from `@amerfathullah/myds-react/icon` (220 icons). `MalaysiaFlagIcon` (32×16, full colour) is among them, but it is a national mark: only an official service may show it, and the Masthead already does.
- **Drawing.** Generic, WYSIWYG and social icons are drawn on a 20×20 viewBox in `currentColor` (a stroke for outline icons, a fill for `-fill` icons, text-formatting glyphs and logos), so you colour them with a `txt-*` token. The full-size legacy marks (32×32) also take `currentColor`. An icon is a glyph, so a text token is on-role. These keep fixed colours: the `*-media` file icons (50×50), the 24×24 `Mini…` legacy set (`gray-800` #27272A, which doesn't re-theme), `JataNegaraIcon`, Google's four-colour logo, the badges on `PdfIcon`, `WordIcon` and `ExcelIcon`, the white tick in `CheckCircleFillIcon`, and the flag. The stroke is 1.5px (`stroke-[1.5px]` on button, dropdown, dialog and tab icons); checkbox ticks are 1.5px small and 2px at medium and large.
- **Size comes from the host component.** Button icons are 16px (small) and 20px (medium and large). Tab icons are 16/20, input icons 18/20/24, date- and time-field icons 16/18/20, and select icons 16/20/20. The spinner is 16/20/24, callout and toast icons are 20px, and the alert-dialog icon is 42px.
- **Sets.** The outline set has a few filled counterparts (`-fill`, and `document-filled`). There are also WYSIWYG glyphs (bold, italic, underline, alignment, lists …), social logos (Facebook, Instagram, X as `TwitterXIcon`, TikTok, YouTube, LinkedIn, Telegram, WhatsApp, GitHub, Figma, Google, RSS), media file icons (`PDFMediaIcon`, `WordMediaIcon`, `ExcelMediaIcon`, `PowerpointMediaIcon`) and 60 legacy icons: 30 full-size (29 agency marks and Jata Negara) and 30 24px `Mini…` icons. Their files are named `legacy-*`, but the components drop the prefix: `JataNegaraIcon`, `PolicePDRMIcon`, `MiniPolicePDRMIcon`. Every other name follows its file (`chevron-down` is `ChevronDownIcon`), except `PDFMediaIcon` and `RSSIcon`.

## Components

Front-matter keys follow the code: `<component>-<variant>` in the library's own variant names, with `-<state>` for a state that has its own colour token. States use the suffixes `-hover`, `-disabled`, `-checked`, `-active` (selected or current) and `-invalid`. A sub-part with different colours from its parent gets `<component>-<part>`. Sizes are a separate axis: a variant entry carries the default size's geometry, and `<component>-size-<small|medium|large>` entries carry only the geometry that changes.

Rules that hold across every component:

- **No `backgroundColor` means no fill.** The element inherits the surface behind it (ghost buttons, links, tab triggers, select ghost).
- **Focus** is a 3px ring in `fr-primary` (`focus:ring-3 focus:ring-fr-primary`) on most focusable controls, danger variants included. Radio shows a 4px `fr-primary` ring on keyboard focus only (`focus-visible:ring-4`), the search bar and the active Input OTP slot a 3px `otl-primary-200` ring, tabs a 2px ring, and a table cell a 3px `primary-600` @ 20% outline. Inputs, textareas, date and time fields and search bars also switch their border to `otl-primary-300`. An invalid date or time field shows `fr-danger` only while it isn't focused. A few controls show no ring; see Known Gaps. Focus has no entries of its own.
- **Press** moves a button down half a pixel.
- **Disabled** controls use `cursor-not-allowed`. A disabled checkbox fades to 30% opacity. A radio fades only when checked; unchecked, it is `bg-washed` at full opacity.
- **Borders** are 1px (`borderColor`). Where a border is a primitive at an alpha, the entry has an 8-digit hex literal and the prose names the source. A border that turns transparent is `#00000000`.

### Buttons & links

- **Button** (`button-*`). The guideline's eight types map onto the code variants: Primary = `primary-fill`, Secondary = `default-outline`, Secondary Colour = `primary-outline`, Tertiary = `default-ghost`, Tertiary Colour = `primary-ghost`, Danger Primary = `danger-fill`, Danger Secondary = `danger-outline`, Danger Tertiary = `danger-ghost`. `unset` removes all variant styling. The default is `primary-fill`, size `small`, Medium weight, `rounded.md` at every size. **The fill variants use primitives** (`primary-600`/`700`, `danger-600`/`700`, `white`), so they look the same in both themes; outline and ghost variants use semantic tokens. Fill and outline variants carry `shadow-button`. Disabled outline buttons drop their border to transparent (`disabled:border-transparent`) but keep the shadow. Icon-only buttons are square with 8, 10 or 12px padding by size. `ButtonIcon` is 16px (small) or 20px (medium and large). `ButtonCounter` is a round badge, `bg-primary-600` + `txt-white` inside most variants and inverted to white inside fill variants (`button-counter-primary-fill`, `button-counter-danger-fill`).
- **Link** (`link-primary`). `primary` colours it `txt-primary`; otherwise it inherits colour and decoration. `underline` is `always` (default), `hover` or `none`. `newTab` opens a new tab.
- **Spinner** (`spinner-gray`, `spinner-white`). A conic-gradient ring that fades from transparent to `txt-black-500` or white, rotating once every 600ms. Sizes are 16, 20 and 24px (default small, gray). It has no role or accessible name, so announce the progress yourself: put visible text beside it, as in a loading button, or pass `role="status"` and an `aria-label`. `show={false}` hides it.
- **ThemeSwitch** (`theme-switch`). It needs `ThemeProvider` from `@amerfathullah/myds-react/hooks`; without it the switch never changes the theme. Switching puts the chosen theme's `value` on `<html>` as a class, so `dark` sets `.dark`, and saves it to `localStorage`; the provider never restores it (see Known Gaps). `as="toggle"` (default) is a small icon-only `default-ghost` button with a 16px `txt-black-900` sun or moon icon, named by the current theme's `label`. `as="select"` is a small `outline` Select whose trigger is named by `selectLabel` (default "Theme"; announced, not shown). Set it in the page's language, e.g. `selectLabel="Tema"`. `themes` replaces the Light/Dark list and its labels, and `onChange` receives the new value.

### Form inputs

- **Input** (`input-*`), from the guideline's Text Input. Sizes are `body-sm`/`md`/`lg` (default small). The border (`otl-gray-200`) sits on the wrapper, and prepend and append addons join it with `otl-gray-200` dividers. Left and right icons are 18/20/24px. These addons approximate the guideline's number field with a leading dropdown, field with leading uneditable text, and field with a trailing button. It has no invalid state; see Known Gaps.
- **Textarea** (`TextArea`, `textarea-*`). Minimum heights are 100, 120 and 150px by size (default medium). It has no resize handle and, like Input, no invalid state.
- **Label** (`label-*`). Sizes `body-sm`/`md`/`lg` (default medium). It dims to `txt-black-disabled` only after a disabled sibling marked `peer`, or inside a disabled ancestor marked `group`. No library field is such a `peer` or `group`, so a Label beside a disabled Input or date field keeps its colour; see Known Gaps.
- **Date field** (`date-field-*`). Sizes small/medium/large (default small) and `disabled`/`invalid` axes. Its sizes use Tailwind text classes: `text-sm` and `text-base` match `body-sm`/`body-md`, and large is `text-lg` 18/28, **off-scale**. With `invalid` omitted (the default), the border is the preset's base primitive `gray-200`, which doesn't re-theme; see Known Gaps. The code fills the focused day, month or year segment with primitive `primary-500` (`date-field-segment-active`), but Chromium and Firefox show their own highlight instead; see Known Gaps. `invalid` sets `aria-invalid` and shows an `otl-danger-300` border with a 3px `fr-danger` ring while the field isn't focused. Focus replaces both with the normal pair (`otl-primary-300`, `fr-primary`). The calendar icon is decorative (`aria-hidden`). It renders no id or label of its own: name it with a Label (`htmlFor`) and pass the matching `id`.
- **Time field** (`time-field-*`). A native time input that matches the date field at every size and state, with a decorative clock icon in place of the calendar. `step` is in seconds and defaults to 60, so it shows hours and minutes. 12/24-hour display follows the user's locale and can't be set, and Chromium can clip a 12-hour AM/PM segment; see Known Gaps. The code fills the focused hour, minute, second or AM/PM segment with primitive `primary-500` (`time-field-segment-active`), with the same caveat. Like the date field, it renders no id or label of its own: name it with a Label and the matching `id`. For booking from fixed availability, offer the times as Select options instead.
- **Date picker / date range picker** (`date-picker-*`). The trigger is a `default-outline` Button in the button's sizes (default small), not a date field. DatePicker's trigger shows a calendar icon (`icon` replaces it) and the date as `dd MMM yyy` (`formatStr`), or the placeholder `dd / mm / yyyy`. DateRangePicker shows two triggers without the icon, joined by a dash, each led by a `txt-black-500` `From:` / `To:` (`Dari:` / `Hingga:` with `locale="ms"`; `fromLabel` / `toLabel` replace them). The From calendar disables days after `to`, and the To calendar days before `from`. From `lg:` the calendar opens in a 304px popover; below `lg:` it opens in a dialog with no close button. The internal calendar has day, month and year views. Its caption is a month toggle and a year toggle in Semibold `text-base` (= `body-md`), each `txt-black-700` until its view is open, then `txt-primary` on `bg-primary-50`, split by a `/` in `bg-black-400` (off-label). Previous and next are 32px icon-only `default-outline` buttons. The selected day is primitive `primary-600` with white text, so it doesn't re-theme. A range fills `bg-primary-100` and hovers to `bg-primary-200`, and today is `txt-primary`. Weekday headings are `body-xs` `txt-black-500`. Days outside the month are at 50% opacity, and disabled days are `txt-black-disabled` with no fill and `cursor-not-allowed`. The trigger takes no `id` or `aria-label`, so a Label can't name it: its accessible name is what it shows, the date or placeholder, after `From:` / `To:` on DateRangePicker.
- **Input OTP** (`input-otp-*`). One 50×68px slot per character, 6px apart, with the digit at `text-4xl` 36/40 Medium, **off-scale**. The active slot shows an `otl-primary-300` border and an `otl-primary-200` ring, and invalid turns both to the danger pair. The caret is a 1px `bg-black-900` bar.
- **Search bar** (`search-bar-*`). Sizes `small` (6px radius), `medium` (default, 8px) and `large` (full). Only small sets a text size (`text-sm` = `body-sm`); medium and large inherit theirs. The large size adds a round submit button filled with a `primary-400` → `primary-600` gradient (`search-bar-submit` records the `primary-600` end). The results panel is `bg-white` with `shadow-context-menu`, joined to the input with no top border. Result rows highlight `bg-washed`, and group headings are `txt-black-500` Medium. The bar has no hover state. `SearchBarSearchButton` and `SearchBarClearButton` are icon-only: pass each an `aria-label`. SearchBar hard-codes its results id, so use one per page; see Known Gaps.
- **Pill** (`pill-*`), the guideline's tags field. `bg-dialog`, `otl-gray-300` border, Medium weight, `rounded.sm`, `shadow-button`. Sizes use `body-xs`/`sm`/`md` (default medium). The remove button renders only when `onDismiss` is set and the pill isn't `disabled`. It is a ghost icon button with a 16px `txt-black-500` cross, whose accessible name is always "close button".

### Selection controls

- **Checkbox** (`checkbox-*`). 16px with `rounded.xs` at small (default); 20px with an off-scale 5px radius at medium and large. Checked and indeterminate fill with primitive `primary-600` (hover `primary-700`) and a white tick, so they don't re-theme. Focus ring is 3px.
- **Radio** (`radio-*`). 16px at small and 20px at medium (default) and large. Checked fills primitive `primary-600` around a `bg-white` dot two-fifths the size. The label is Medium `txt-black-700` at `body-sm`/`body-md`, and at large `text-lg` 18/28, **off-scale**. The hint is `txt-black-500`: `text-xs` 12/16 (off-scale) at small, then `body-sm`, then `body-md`. Items stack 12px apart. Focus ring is 4px, on keyboard focus only.
- **Switch** (`Toggle` + `ToggleThumb`, `toggle-*`). A 24×16, 30×20 (default) or 36×24px track with a white thumb 3px from the edge. The track is `otl-gray-200` (hover `otl-gray-300`) and `bg-primary-600` when checked, which **does** re-theme, unlike checkbox and radio. The thumb slides over 200ms. Every switch is announced as "Toggle", and no prop renames it; see Known Gaps.

### Feedback

- **Callout** (`callout-*`). The guideline's Success, Warning, Information and Error map to `success`, `warning`, `info` (default) and `danger`. It has a `bg-{status}-50` fill, a 20px status icon and a Semibold `body-sm` title in `txt-{status}`. The description is `body-sm` `txt-black-900`, and a dismiss cross is `txt-black-700`. 12px padding, `rounded.md`, no border. The `dismissible` cross has no accessible name, and Callout renders `role="alert"`, which screen readers announce at once; see Known Gaps.
- **Toast** (`ToastRoot` or `AutoToast`, `toast-*`). Variants `message` (default), `success`, `info`, `warning` and `error`. The card is `bg-dialog-active` with a `bg-washed-active` border (an off-label pairing) and `shadow-card`. A Semibold `body-sm` title and a 20px icon take the variant colour (`message` has no icon and a `txt-black-700` title), and the description is `body-sm` `txt-black-700`. `ToastClose` is a 20px `txt-black-500` cross, top-right; pass it an `aria-label` when you compose a toast by hand. AutoToast's close button has no name; see Known Gaps. A 4px progress bar along the bottom counts down with `animate-expire` (default duration 5000ms) and pauses on hover. It is filled with `bg-txt-{status}` (off-label), or `bg-washed` for `message`. The viewport stacks toasts in the bottom-right, 18px from the edge on mobile and 24px from `sm:`, up to 384px wide from `md:`.
- **Tag** (`tag-*`), also used by AnnounceBar for the guideline's Phase Banner. The guideline's Gray, Brand, Success, Danger and Warning map to `default`, `primary`, `success`, `danger` and `warning`. It has a `bg-{status}-50` fill (`bg-washed` for default) and `txt-{status}` text. The 1px border is the primitive @ 20%, which doesn't re-theme: `gray-600`, `primary-600`, `success-700`, `danger-600` and `warning-700` (`#52525B33`, `#2563EB33`, `#15803D33`, `#DC262633`, `#A1620733`). Sizes are 22, 28 and 32px high, and the component defaults to `medium`. `mode` is `default` (8px radius, the component default) or `pill` (full). An optional dot of 6, 8 or 10px takes the text colour.
- **Skeleton** (`skeleton-*`). A loading placeholder. `shape` is `line` (default: full width, at least 12px high, full radius), `circle` (full radius) or `block` (`rounded.md`); the author sets the size with `className`. It shimmers with a `bg-black-100` → `bg-black-300` → `bg-black-100` gradient on `animate-shimmer`, and under `prefers-reduced-motion` it stops and shows a flat `bg-black-100` fill. It is always `aria-hidden`, so the loading region carries `aria-busy="true"` and visually hidden "Loading…" text. Use it when the loading content's layout is known; use Spinner for an action in progress or an unknown layout.
- **Tooltip** (`tooltip`). `bg-black-900` with `txt-white`, `text-xs` 12/16 (**off-scale**), 8×12px padding, `rounded.sm`, `shadow-context-menu`, 50–250px wide, with an arrow in the same fill. It fades in over 200ms.

### Navigation

- **Breadcrumb** (`breadcrumb-*`). Medium `body-sm`. Links are `txt-black-500`, underlined and `txt-black-900` on hover. The current page is `txt-black-900`. Each item is capped at 200px, and separators are 24px chevrons in `bg-black-400`, an off-label pairing. `fill` (the guideline's "with wrapper") puts the trail on `bg-washed` with 4×12px padding.
- **Pagination** (`pagination-*`). Page numbers are 40px `default-ghost` buttons, previous and next are `default-outline` buttons, and the current page fills `bg-washed-active`. The ellipsis is a 16px `txt-black-700` icon. Previous is disabled on the first page and next on the last; disabled, they lose their shadow. `type` is `default`, `simple` or `full`, the guideline's Types 1–3.
- **Tabs** (`tabs-*`). Variants `line` (default), `pill` and `enclosed`; sizes `small` (default) and `medium`; the list is `full` or `fit` width. Triggers are Medium `txt-black-500`, turning `txt-black-900` on hover and when active. `line` marks the active tab with a 2px primitive `primary-600` bar over a 1px `otl-gray-200` baseline. `pill` fills the active tab `bg-washed-active` with a full radius. `enclosed` sits in a `bg-washed` list, and the active tab is `bg-dialog-active` with an `otl-gray-200` border. The focus ring is 2px. Tab icons are 16/20px.

### Data display

- **Accordion** (`accordion-*`). Items are `bg-white` with an `otl-gray-200` bottom border. Triggers are Medium `txt-black-700` at `text-base leading-none` (16/16, **off-scale**) with 16px vertical padding. They turn `txt-black-900` on hover and when open, and underline on hover and on keyboard focus; the underline is their only focus indicator (see Known Gaps). A `txt-black-500` chevron rotates 180° over 300ms. Content is `body-sm` `txt-black-700` with 16px bottom and 36px right padding, and opens with `animate-accordion-slide-down`.
- **Summary list** (`summary-list-*`). Table markup at `text-sm` Medium: `SummaryListBody` is a `<table>`, each `SummaryListRow` a `<tr>` with an `otl-gray-200` bottom border, and each `SummaryListTerm` a row header (`<th scope="row">`). `SummaryListHeader` always renders an `<h1>` (see Known Gaps): Semibold `text-xl` with `leading-[30px]`, which renders exactly `body-xl`, 24px above the table. Terms are `txt-black-500`, at least 190px wide, and details are `txt-black-900`. An optional actions column (`SummaryListAction`) is right-aligned, and `SummaryListAddition` adds a `txt-black-900` column at least 144px wide.
- **Table** (`table-*`). Headers are `txt-black-500` Medium at `text-xs` 12/16 (**off-scale**) over a 2px `otl-gray-200` rule. The header row is sticky inside the table's scroll wrapper, with no fill. Cells are `txt-black-900` at `text-sm` with `leading-[33.11px]` (14/33.11, **off-scale**) and `otl-gray-200` row borders; footer cells have 2px rules above and below. A clicked cell shows a 3px primitive `primary-600` @ 20% outline, not the `fr` ring. Loading rows show `TableSkeleton` (`table-skeleton`), a Skeleton with the `line` shape. `TableEmpty` centres `txt-black-500` text ("No data available" unless you pass your own) with 32px vertical padding. `className` on `Table` styles its `overflow-auto` scroll wrapper, not the `<table>`.
- **Data table** (`data-table-*`). Builds on Table, and every cell is `bg-white`. Column `meta` turns on sorting (`sortable`), column widening (`expandable`) and a header tooltip (`tooltip`). `pin={{ left, right }}` pins columns, `selection={{ mode, id_by }}` adds a checkbox or radio column, and `nest={{ id_by }}` (the field holding sub-rows) with `Cell.Expand` nests rows. Sort and widen controls are small `primary-outline` buttons with 16px `txt-primary` icons (`data-table-sort-active`). They exist only from `lg:` up, appear on header hover and stay while the column is sorted or widened; see Known Gaps. A sortable or expandable header's border turns `otl-primary-300` on hover and stays so while the column is widened (`data-table-header-expanded`). Cells of a column defined with an `id` truncate at 230px unless the column is widened. A nested row's toggle is a small `default-ghost` button whose chevron rotates 90°, and each level indents 16px. Selection controls are checkboxes and 16px radios filled with primitive `primary-600`. The last pinned column casts an inset `shadow-[inset_±3px_0_8px_-8px]` along its inner edge.

### Overlays

- **Dialog / Alert dialog** (`dialog-*`). A centred `bg-white` panel with an `otl-gray-200` border and `rounded.lg`, at least 300px wide. It spans the screen minus 36px (18px each side) and stops at 512px from `sm:` (`max-w-lg`). Behind it is a `gray-700` @ 60% overlay. It has no shadow; see Elevation. The close control is a small icon-only `default-outline` button, top-right, which `hideClose` removes. The header (24px padding) has an optional `otl-gray-200` bottom border. The title is Semibold `body-lg` `txt-black-900`, and the description is `body-sm` `txt-black-700`. Alert dialogs require `variant`: `default` (no icon), `info`, `success`, `warning` or `danger`. The last four lead with a 42px status icon in that colour, 16px above the text (`dialog-icon-*`; `info` uses `dialog-icon-primary`). Footer actions align `start`, `full` or `end` (the guideline's Left, Full, Right, default end), stack full-width below `sm:`, and can take an `otl-gray-200` top border.
- **Dropdown** (`dropdown-*`), the guideline's dropdown menu or context menu. A `bg-dialog` panel with an `otl-gray-200` border, 5px padding, `rounded.md`, `shadow-context-menu`, at least 160px wide. Items are Medium `text-sm` (= `body-sm`) `txt-black-700` with 16px icons and `rounded.xs`. They highlight `bg-washed-active` + `txt-black-900`, or `bg-danger-50` for the `danger` variant.
- **Select** (`select-*`). Trigger variants are `outline` (default) and `ghost`, the guideline's Default and Tertiary, with the same three sizes and padding as the button (default small). An optional `SelectLabel` prefix is `txt-black-500` (`txt-black-900` for multi-select), and a count badge is primitive `primary-600`. The content panel is `bg-dialog` with an `otl-gray-200` border, `rounded.md`, `shadow-context-menu`, and a maximum height of 256/288/320px by size. Items are Medium `txt-black-700`, one step smaller than the trigger (`body-xs`/`sm`/`md`). They highlight `bg-washed`, and a selected item shows a `primary-600` check. Group labels are Semibold `body-xs` in primitive `gray-400`, and separators are `otl-divider`.
- **Popover** is internal and hosts the date pickers: a `bg-dialog` panel with an `otl-gray-200` border, `rounded.md` and `shadow-context-menu`, which the date pickers make 304px wide with no padding.

### Page-level

These frame the page; their responsive behaviour is under [Layout → Page frame](#page-frame).

- **SkipLink** (`Skiplink`, `skiplink`). A small `primary-outline` button (the entry mirrors `button-primary-outline`) that stays visually hidden until focused. It then appears 16px from the left and 44px from the top at `z-[99]`, above the Navbar (`z-50`) and the page, with `shadow-context-menu`. Toasts share its level, and only an open dialog sits higher.
- **Masthead** (`masthead-*`). The official-site banner: a `bg-washed` strip with the Malaysia flag, `body-sm` `txt-black-700` text, and a `txt-primary` "Here's how you know" trigger (`tracking-[-0.01em]`). Below `sm:` the trigger shows only its 16px chevron, on a `bg-otl-gray-200` fill (an off-label pairing). From `sm:` it shows its label with no fill, and from `xl:` its radius drops from `rounded.md` to `rounded.sm`. The trigger expands a two-column explainer with 24px `txt-black-500` icons and `txt-black-900` Medium headings. It hides when printed.
- **Navbar** (`navbar-*`). The page's `<header>` landmark, with a `<nav>` inside: a sticky `bg-white` bar with an `otl-gray-200` bottom border and `shadow-button`, 64px tall (56px below `md:`), with 24px side padding (18px below `md:`), capped at 1280px. It hides when printed. The agency logo slot sits on the left, with the agency name in Semibold `body-lg` **Poppins** (`font-heading`) `txt-black-900`, at most 200px. A long name drops to `body-xs` with `leading-[14px]` (12/14, **off-scale**) across two lines. Menu items are Medium `body-sm` `txt-black-700` and highlight `bg-washed`, and an open dropdown trigger stays `bg-washed`. Dropdown items are Regular `text-sm` (= `body-sm`) with `rounded.xs`. From `xl:` up, dropdowns open 8px below their trigger as `bg-white` panels at least 220px wide, with 6px padding and `shadow-context-menu`. Below `xl:`, a `bg-dialog` mobile menu with an `otl-gray-200` border opens over a `gray-700` @ 60% overlay, with dropdown items indented 12px.
- **Footer** (`footer-*`). `bg-gray-50` with an `otl-gray-200` top border and `body-sm` text. It sets no text colour; its links are `txt-black-700` (`footer-link`). It hides when printed. Its parts are `FooterSection` (the grid, with an `otl-gray-200` bottom border), `SiteInfo` (a plain first column), `FooterLogo` (the agency `logo` slot and a Semibold `body-md` `txt-black-900` name, `logoTitle`), `SiteLinkGroup` (a `<nav>` landmark over up to 8 links; `linkCount` changes the cap) and `SiteLink` (links that underline and turn `txt-black-900` on hover). A string `groupTitle` renders as Semibold `txt-black-900` text, not a heading (`footer-group-title`), and names its `<nav>` unless you pass an `aria-label`. Give each group a distinct title. An element `groupTitle` renders as given and names nothing: for a heading, pass e.g. `<h2 id="services-title">` and set `aria-labelledby="services-title"` on the group. The `FooterLogo` name renders in Inter, because it asks for an undefined `font-poppins`.
- **AnnounceBar** (`announce-bar`), the guideline's Phase Banner. A Tag followed by `text-sm` (= `body-sm`) `txt-black-700` text, with 8px vertical padding and an optional `otl-gray-200` bottom border. The Tag's size is left to the author.
- **CookieBanner** (`cookie-banner-*`). A `bg-white` card with an `otl-gray-200` border, `rounded.lg` and `shadow-card`, at most 500px wide. It has a Semibold `body-md` title, a `body-sm` description, and a `medium` `primary-outline` action row that stacks below `sm:`. A preferences view adds checkboxes. The close button is a 16px cross 16px from the top-right corner. It slides up from the bottom over 400ms. It is a modal dialog with no overlay: while open it holds keyboard focus and hides the rest of the page from screen readers, and the first click outside it, or Escape, dismisses it; see Known Gaps.

## Do's and Don'ts

### Do

- Use the `@amerfathullah/myds-react` component before hand-building one.
- Build new UI with semantic tokens. The colour guideline says primitives "do not have a corresponding dark mode variant".
- Choose a token by what the pixel _is_, whatever the utility: a surface takes `bg`, a glyph or icon takes `txt`, a line, edge or ring takes `otl`, and focus takes `fr`.
- Use the `text-body-*` and `text-heading-*` classes in new UI.
- Pair every `text-heading-*` with `font-heading`. Use Inter (`font-body`) for body and rich text.
- Open every page with SkipLink first, outside any `<header>` and never inside a `<nav>`, then the Masthead and the Navbar.
- Put agency identity only in the Navbar and Footer logo slots.
- Show keyboard focus with the `fr-primary` ring. `fr-danger` marks an invalid field, not focus.
- Use primary for the one primary action on a view.
- Keep motion simple and functional; every motion needs a purpose.

### Don't

- Don't recolour primary to match an agency.
- Don't rebuild or restyle the Masthead, or remove its flag.
- Don't use Poppins in body text or rich text.
- Don't borrow a token from another role for its colour, such as `bg-txt-*` to fill a surface.
- Don't style new UI with primitives or inline hex.
- Don't use Tailwind's default text sizes (`text-xs`, `text-sm`, `text-lg`, …) in place of the body and heading scale.
- Don't use Tailwind's own shadow scale (`shadow-2xs` … `shadow-2xl`, bare `shadow`) or `inset-shadow-*`: the preset clears them, so they generate nothing. Don't use `drop-shadow-*` or `text-shadow-*` either: they still generate Tailwind's shadows, which aren't MYDS's. Use `shadow-button`, `shadow-card` or `shadow-context-menu`, or no class for no shadow.
- Don't use weights above Semibold 600.
- Don't use status colours decoratively.

## Iteration Guide

1. Work on one component at a time and reference its `{components.*}` key.
2. Reach for the React component first; hand-style only what the library lacks.
3. Use `{token.refs}` and semantic token classes, never inline hex.
4. Check every change in both themes by toggling `.dark` on the root.
5. Give a state (hover, disabled, checked, invalid) its own styling only where a distinct token exists. Show focus with the `fr-primary` ring.
6. When unsure about emphasis, step up the type scale before reaching for colour.

## Known Gaps

Each entry opens with its kind. A **Divergence** is something the guideline and the library both define with different values; this file prints the library's. A **Gap** is something only one of them defines. A **Defect** is a place where the library contradicts itself, described by what it actually renders.

### Colour

- **Expected lint warnings.** `npx @google/design.md lint DESIGN.md` reports zero errors. It warns on:
  - orphaned tokens, because the front matter records every exposed token, not only those components use;
  - `missing-primary`, because MYDS has no `primary` key (see Colors);
  - unknown sub-tokens `borderColor` and `fontWeight`, which the spec doesn't define but MYDS needs;
  - seven contrast pairs. Four are disabled states (`button-{primary,danger}-fill-disabled`, `button-danger-{outline,ghost}-disabled`): the linter ignores alpha, and WCAG exempts disabled controls. One is `masthead-trigger`, `txt-primary` on `otl-gray-200` at 4.07:1: that fill shows only below `sm:`, where the trigger is just its chevron, and an icon needs 3:1. The other two are real wherever they render: the focused date-field and time-field segments put `txt-white` on `primary-500` at 4.15:1. Chromium and Firefox don't render that pair (see Known Gaps → Components).
- **Gap:** the colour guideline is published as images only, so it can't be compared with the code value by value. All colour here comes from code.
- **Gap:** the design guideline advertises a Theme Customizer for adjusting colours to an agency's branding. It is not built.
- **Defect:** `otl-warning-300` resolves to `danger-300` (light) and `danger-700` (dark), while `otl-warning-200` uses the warning scale. It is reproduced as built.
- **Divergence:** the guideline tells designers to style with semantic tokens so that everything re-themes, but some components use primitives, which stay the same colour in dark. These are button fills and their counters, checkbox, radio, the date-picker selected day, the date- and time-field focused segments, the tabs line indicator, the search-bar submit button, the select counter and check, the select group title (`gray-400`), data-table selection, the switch thumb (`white`), the white spinner, the table cell's focus outline (`primary-600` @ 20%, 3px), the dialog and Navbar mobile-menu overlays (`gray-700` @ 60%), and tag borders. The preset's base layer also colours a bare border and an unstyled placeholder with primitives (see Theming).
- **Defect:** `bg-black-600` and `bg-black-950` are defined in both theme files but the preset exposes no class for them. The `black` primitive is not exposed either, and no token maps to it. Five status outline tokens (`otl-gray-600-20`, `otl-primary-600-20`, `otl-danger-600-20`, `otl-success-700-20`, `otl-warning-700-20`) are commented out, which is why tag borders use primitives @ 20%.
- **Defect:** disabled tokens differ in form. `bg-{primary,danger,success,warning}-disabled` are opaque, while `bg-white-disabled`, `bg-black-disabled`, `txt-*-disabled` and `otl-*-disabled` are 40% alpha. `txt-danger-disabled` is built on `danger-600`, where `txt-danger` uses `danger-700`.
- **Defect:** `bg-washed-active` equals `bg-washed`, and `bg-dialog-active` equals `bg-dialog`, in the light theme. So in light, a selected pill tab or current pagination item is barely set apart from its surface.

### Typography

- **Gap:** the guideline defines Heading 3X Small (`<h5>`, 16/24) and 4X Small (`<h6>`, 14/20). The library has no token for either.
- **Gap:** the guideline defines Body 2X Small (10/12) and Body 2XL–6XL (24/32, 30/38, 36/44, 48/60, 60/72). The library has no token for any of them.
- **Gap:** the guideline's Rich Text Format scale has no tokens. It is H1 30/38, H2 24/32, H3 20/28, H4 18/26, H5 16/24, H6 14/20 and paragraph 16/28 with 28px paragraph spacing, all Inter. There is also 6px list spacing and 12px paragraph spacing for the body sizes. The guideline's own WYSIWYG style list contradicts the RTF scale, giving Paragraph 15/27 and Heading 3 20/30.
- **Divergence:** `body-xl` is 20/30 in code; the guideline gives 20/28.
- **Divergence:** 15 components (accordion, announce-bar, button, calendar, callout, date-field, dropdown, input-otp, navbar, radio, search-bar, summary-list, table, time-field, tooltip) set Tailwind's default sizes or `leading-*` overrides instead of the MYDS scale. Where they match a token (`text-sm` = `body-sm`, `text-base` = `body-md`), the entry references it. The off-scale values rendered are 12/16 (`text-xs`), 18/28 (`text-lg`), 36/40 (`text-4xl`), 16/16, 12/14 and 14/33.11.
- **Gap:** neither `full.css` nor the Tailwind import applies Inter or Poppins; the page gets Tailwind's system sans stack. Apps must add `font-body` and `font-heading` themselves, and within the library `font-heading` appears only on the Navbar agency name.
- **Defect:** `font-mono` (Roboto Mono) is declared but the font is never loaded, so it falls back to the system monospace.
- **Defect:** the Footer agency name asks for `font-poppins`, which doesn't exist, so it renders in the inherited family. The search bar's medium and large sizes ask for `text-md`, which doesn't exist, so they inherit their text size.

### Layout

- **Gap:** the preset defines no breakpoints or container, so Tailwind's defaults apply. The Tailwind 3 preset carried them commented out: mobile 354, tablet 768 and desktop 1280, with "bp\_" variants 390, 816 and 1328.
- **Divergence:** the Footer switches to 4 columns at tablet (`md:grid-cols-4`); the guideline's tablet grid has 8.
- **Divergence:** the Navbar collapses to its mobile menu below `xl` (1280); the guideline's desktop tier starts at 1024.

### Elevation

- **Defect:** the preset replaces Tailwind's shadow scale, so `shadow-lg` generates nothing. The dialog renders with **no shadow**, and an accordion item gets no shadow when focus is inside it (`focus-within:shadow-lg`).

### Shapes

- **Divergence:** buttons are 8px (`rounded-md`) at every size; the guideline gives small buttons 6px.
- **Divergence:** tag `mode="default"` is 8px (`rounded-md`); the guideline's Style 2 is 6px.

### Motion

- **Gap:** the guideline's easings have no tokens: `instant`, `linear` cubic-bezier(0,0,1,1), `easeout` cubic-bezier(0,0,0.58,1) and `easeoutback` cubic-bezier(0.4,1.4,0.2,1). Neither does its `[type].[duration]` naming (e.g. `easeoutback.medium`).
- **Divergence:** every `-slide-` animation runs at 300ms, which is not one of the guideline's durations (200, 400, 600ms).
- **Divergence:** Toast defaults to 5000ms with the linear `animate-expire` bar. The motion guideline gives `easeoutback.medium` (400ms) for enter and exit and `linear.3000` for the bar. The toast guideline gives a 200ms ease-in-out slide and a 3s bar.
- **Defect:** `animate-caret-blink` (input OTP) is not defined, so the caret doesn't blink. `transition-color` (switch) is not a Tailwind class, so the track's colour change is not transitioned; the thumb still slides.

### Iconography

- **Divergence:** large buttons use a 20px icon; the guideline gives 24px.
- **Gap:** no foundation page gives usage rules for the Jata Negara, and the exported `JataNegaraIcon` (`legacy-jata-negara`) is unused by the library.

### Components

- **Gap:** these guideline components have no library component: backlink, character count, details (a chevron disclosure, distinct from the accordion), file upload, inset text (including block quote), panel (blue, green, yellow and red), password input, task list, and the WYSIWYG editor. The guideline's text-input types are approximated: number field with a leading dropdown, field with leading text, and field with a trailing button use Input's prepend and append addons. The tags field is Pill.
- **Gap:** the guideline has no time-input page. The library's TimeField (and the Select time-slot pattern in its docs) has no design reference.
- **Gap:** the guideline has no skeleton page. The library's Skeleton (`line`, `circle`, `block`) has no design reference.
- **Gap:** the guideline's text input has an error state, a red border that stays when the field is focused. Input and TextArea have no `invalid` prop and no `aria-invalid` styling; only DateField, TimeField and InputOTP have one.
- **Divergence:** Radio has small, medium and large sizes; the guideline has Small and Medium.
- **Divergence:** Switch has small, medium and large sizes; the guideline has Medium and Large.
- **Divergence:** the guideline keeps a date field with an error highlighted when focused. As built, focus replaces an invalid date or time field's `otl-danger-300` border and `fr-danger` ring with the normal `otl-primary-300` and `fr-primary` pair.
- **Divergence:** the guideline calls information callouts non-critical, but every Callout renders `role="alert"`, so screen readers interrupt the user to read even a static one. Props override the role: pass `role="note"`, or `role="status"` for a polite update.
- **Divergence:** Dialog stops at 512px (`sm:max-w-lg`); the guideline gives 400px for alerts and 800px for forms.
- **Divergence:** the dialog overlay is `gray-700` @ 60%; the guideline gives black @ 50%.
- **Divergence:** Toast is at most 384px wide (`md:max-w-sm`); the guideline gives 300–600px.
- **Divergence:** CookieBanner sits bottom-right, 16px from the edges from `sm:` and edge to edge on mobile. The guideline puts it bottom-left with a 24px margin on desktop and tablet, and centred with 18px margins on mobile.
- **Divergence:** the guideline keeps the cookie banner visible until the user accepts, rejects, customises or closes it. As built, CookieBanner is a modal dialog: it blocks the page, and the first click outside it or Escape dismisses it without a choice. Pass `modal={false}` so it doesn't block the page, and `onInteractOutside` and `onEscapeKeyDown` handlers that call `event.preventDefault()` to keep it open until the user chooses.
- **Divergence:** the guideline puts the skip link first after `<body>` and, when the page has a `<header>`, inside it. The Navbar renders the page's `<header>` after the Masthead, so SkipLink can't be both. Put it first, outside any header: wrapping SkipLink and the Masthead in a second `<header>` adds a second banner landmark, and HTML doesn't allow a `<header>` inside another.
- **Gap:** the guideline caps search results at 400px high; the component sets no maximum.
- **Gap:** the guideline turns the search bar's border `otl-gray-300` on hover; the component has no hover state.
- **Defect:** Pagination's JSDoc names its types `basic`, `basic-alternate` and `number`, but the prop accepts `default`, `simple` and `full`.
- **Defect:** AnnounceBar asks for `min-height-[28px]`, which is not a Tailwind class (`min-h-[28px]` is), so it has no minimum height.
- **Defect:** the source holds a Sheet (`sheet.tsx`), but the package doesn't export it (there is no `./sheet` entry) and no component uses it, so it can't be imported.
- **Defect:** AlertDialog's docs say `variant` defaults to `default`, but the prop is required: without it, `AlertDialogContent` throws when it renders.
- **Defect:** `SummaryListHeader` always renders an `<h1>` and takes no prop to change its level, so a page that already has an `<h1>` gets a second one. Leave it out and put your own heading of the right level in its place.
- **Defect:** DateField and TimeField colour their border only when `invalid` is set. With `invalid` omitted (the default), the bare `border` falls back to the preset's base primitive `gray-200` (#E4E4E7), which doesn't re-theme: in dark the field keeps a light edge where `otl-gray-200` would be #27272A. Pass `invalid={false}` for `otl-gray-200`.
- **Defect:** DateField and TimeField style the focused segment with `[&::-webkit-datetime-edit-day-field:focus]`-style classes. Chromium (checked in 153) never matches `:focus` on these pseudo-elements, and Firefox has no `::-webkit-datetime-edit-*` pseudo-elements, so in both a focused segment shows the browser's own highlight, not `primary-500` with `txt-white`. The `-segment-active` entries record what the code asks for.
- **Defect:** in a 12-hour locale, Chromium can clip TimeField's AM/PM segment by a few pixels at 1x pixel density ("AM" reads "AN"), because the input's width doesn't count the 2px separator margins (`[&::-webkit-datetime-edit-text]:mx-[2px]`). Widening the wrapper doesn't help; widen the input itself. `style` reaches the `<input>` and `className` the wrapper, so pass e.g. `style={{ minWidth: "5.5rem" }}` at small.
- **Defect:** Label's disabled colour comes only from `peer-disabled` and `group-disabled`, and no library field is such a `peer` or `group` (Input, DateField and TimeField put `className` on a wrapper). A Label beside a disabled field keeps `txt-black-700`. Wrap the field and its Label in `<fieldset disabled className="group">`, or give the Label `text-txt-black-disabled`.
- **Defect:** `ThemeProvider` saves the chosen theme to `localStorage` (`storageKey`, default `theme`) but never reads it back, and never puts `defaultTheme` on `<html>`, so a reload loses the choice. To keep it, read the key before render, add its class to `<html>` yourself, and pass the same value as `defaultTheme`.
- **Defect:** SearchBar hard-codes `id="search-input"` on its results and `aria-controls="search-input"` on its input, and overwrites an `id` you pass. Two SearchBars on one page duplicate the id, so use one per page.
- **Defect:** Switch can't be named. `ToggleThumb`'s `role="switch"` element hard-codes `aria-label="Toggle"` and takes only `className`, so every switch is announced as "Toggle" in English, whatever it controls. `Toggle`'s `id` goes to a visually hidden checkbox that is also focusable, so a Label's `htmlFor` names that checkbox rather than the switch, and keyboard users meet two tab stops per switch. No prop fixes either.
- **Defect:** some components have no accessible name, or a fixed English one. Name these yourself: `SearchBarSearchButton`, `SearchBarClearButton` and a hand-composed `ToastClose` with `aria-label`, and Spinner with `role="status"` and `aria-label`. ThemeSwitch takes its names from the `themes` labels and `selectLabel`, and DateRangePicker its `From:` / `To:` from `fromLabel` / `toLabel`. These can't be renamed: Callout's `dismissible` cross, which has no name (leave it off and wrap your own labelled button in `CalloutClose`); AutoToast's close button and `role="img"` status icon, the CookieBanner close cross and DataTable's radio-column reset button, which have none either; the date-picker triggers, named only by what they show; and Switch (above).
- **Defect:** more components hard-code English accessible names, so a Malay-language service announces them in English. Rename these with `aria-label`: the Navbar menu toggle ("Open navigation menu" / "Close navigation menu"), the Masthead trigger ("Toggle masthead", which replaces its visible label as its name), and the Breadcrumb ("breadcrumb") and Pagination ("pagination") landmarks. These can't be renamed without replacing the control: the Navbar's `<nav>` ("Main", Radix's default; `NavbarMenu` forwards no props to it), Pagination's previous, next and page buttons ("previous page", "next page", "page 3"; with `asChild`, `PaginationPrevious` and `PaginationNext` carry no name, so name your own element), the Dialog close button ("Close"; pass `hideClose` and render your own `DialogClose`), Pill's remove button ("close button"), the date pickers' previous and next buttons ("Go to the Previous Month" / "Go to the Next Month" in the day view, "Go to the Previous Year" / "Go to the Next Year" in the month view) and their day buttons and weekday headings, which react-day-picker names in English (e.g. "Friday, October 30th, 2026") whatever `locale` is, the table tooltip trigger ("Tooltip"), and DataTable's selection controls ("checkbox", "radio", and "selection-column" on their header) and nested-row toggle ("expand row"). `PaginationEllipsis`'s "More pages" sits inside `aria-hidden`, so it is never announced.
- **Defect:** Link, Breadcrumb links, Footer links, Navbar menu items, the Navbar dropdown trigger and the table tooltip trigger have no `fr-*` focus ring; they fall back to the browser's default `:focus-visible` outline. The Toast close button (`focus:outline-hidden`) and the Accordion trigger (`outline-hidden`) remove that outline without adding a ring, so the Toast close button shows no focus indicator at all and the Accordion trigger only its focus underline. The ring is written directly in 15 of the 42 component files (Accordion's sets only a colour, on the non-focusable item); Pagination, the date pickers and other composites get it from Button.
- **Defect:** DataTable's sort and widen buttons are `invisible` until their header is hovered or the column is sorted or widened, and `hidden` below `lg:`. Keyboard users can't reach an unsorted column's sort button, nobody can sort or widen below 1024px, and each button holds only an icon, with no accessible name. To make sorting reachable, leave `sortable` off and put your own labelled button in the column's `header`.
