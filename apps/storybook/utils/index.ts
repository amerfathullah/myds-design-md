export const createStory = (args: any, theme: "light" | "dark" = "light") => {
  return {
    parameters: {
      backgrounds: {
        options: { dark: { name: "dark", value: "#18181B" } },
      },
    },
    globals: {
      backgrounds: { value: theme },
    },
    args: args,
  };
};

export const createRender = (
  render: any,
  theme: "light" | "dark" = "light",
) => {
  return {
    parameters: {
      backgrounds: {
        options: { dark: { name: "dark", value: "#18181B" } },
      },
    },
    globals: {
      backgrounds: { value: theme },
    },
    render,
  };
};
