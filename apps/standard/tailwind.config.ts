import { preset } from "@govtechmy/myds-style";

// Loaded from app/global.css with `@config`. Tailwind 4 reads it through its
// legacy JS config support until @govtechmy/myds-style ships a CSS preset.
const config = {
  presets: [preset],
};

export default config;
