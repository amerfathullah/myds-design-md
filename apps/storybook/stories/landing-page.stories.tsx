import { fn } from "storybook/test";
import LandingPage from "./components/landingPage";

export default {
  title: "@govtechmy/examples/LandingPage",
  component: LandingPage,
  // remove the automatic documentation for Layout
  tags: ["!autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export const Mobile = {
  globals: {
    viewport: { value: "mobile1" },
  },
};

export const Tablet = {
  globals: {
    viewport: { value: "tablet" },
  },
};

export const Desktop = {
  globals: {
    viewport: { value: "desktop" },
  },
};
