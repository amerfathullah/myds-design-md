import Article from "./components/article";

export default {
  title: "@govtechmy/examples/Article",
  component: Article,
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
