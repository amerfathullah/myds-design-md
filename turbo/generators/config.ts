import { PlopTypes } from "@turbo/gen";

import {
  componentNameError,
  generateComponent,
} from "./scripts/generate-component";
import {
  type DocsGroup,
  docsGroups,
  generateDocsPage,
} from "./scripts/generate-docs-page";
import { generateHook, hookNameError } from "./scripts/generate-hook";
import { generateIcons } from "./scripts/generate-icons";

interface ComponentPrompt {
  framework: "react" | "vue" | "angular";
  title: string;
  has_story: boolean;
}

interface HookPrompt {
  framework: "react";
  title: string;
}

interface MDXPrompt {
  group: DocsGroup;
  title: string;
}

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  // A component's or hook's file name is its name in dash-case, as a page's
  // is. A component is named in PascalCase, and a hook in camelCase.
  const dashCase: (text: string) => string = plop.getHelper("dashCase");
  const pascalCase: (text: string) => string = plop.getHelper("pascalCase");
  const camelCase: (text: string) => string = plop.getHelper("camelCase");

  // Component generator. Its action rejects, having changed nothing, if a file
  // it would write exists already or the package exports the name already,
  // and turbo gen prints why.
  plop.setActionType("write component", (answers) => {
    const { title, has_story } = answers as ComponentPrompt;
    return generateComponent({
      root: answers.turbo?.paths?.root,
      slug: dashCase(title),
      name: pascalCase(title),
      story: has_story,
    });
  });

  plop.setGenerator("component", {
    description: "Scaffolds a component",
    prompts: [
      {
        type: "list",
        choices: ["react"], // vue and angular are not supported yet
        default: "react",
        name: "framework",
        message: "For which library/framework? ",
      },
      {
        type: "input",
        name: "title",
        message: "Component name:",
        validate: (input: string) => {
          if (input.includes(".")) {
            return "Component name cannot include an extension";
          }
          if (input.includes(" ")) {
            return "Component name cannot include spaces";
          }
          if (!input) {
            return "Component name is required";
          }
          return componentNameError(dashCase(input), pascalCase(input)) ?? true;
        },
      },
      {
        type: "confirm",
        default: true,
        name: "has_story",
        message: "Include a story? (apps/storybook)",
      },
    ],
    actions: [{ type: "write component" }],
  });

  // Hook generator. Its action rejects, having changed nothing, if its file
  // exists already or the hooks entry's barrel exports the name already, and
  // turbo gen prints why.
  plop.setActionType("write hook", (answers) => {
    const { title } = answers as HookPrompt;
    return generateHook({
      root: answers.turbo?.paths?.root,
      slug: dashCase(title),
      name: camelCase(title),
    });
  });

  plop.setGenerator("hook", {
    description: "Scaffolds a hook",
    prompts: [
      {
        type: "list",
        choices: ["react"], // vue and angular are not supported yet
        default: "react",
        name: "framework",
        message: "For which library/framework? ",
      },
      {
        type: "input",
        name: "title",
        message: "Hook name:",
        validate: (input: string) => {
          if (input.includes(".")) {
            return "Hook name cannot include an extension";
          }
          if (input.includes(" ")) {
            return "Hook name cannot include spaces";
          }
          if (!input) {
            return "Hook name is required";
          }
          return hookNameError(dashCase(input), camelCase(input)) ?? true;
        },
      },
    ],
    actions: [{ type: "write hook" }],
  });

  // MDX generator. Its action rejects, having changed nothing, if the page
  // exists already or it can't list it in the sidebar, and turbo gen prints
  // why. A page's file name is its title in dash-case, as the other
  // generators' are.
  plop.setActionType("write docs page", (answers) => {
    const { group, title } = answers as MDXPrompt;
    return generateDocsPage({
      root: answers.turbo?.paths?.root,
      group,
      title,
      slug: dashCase(title),
    });
  });

  plop.setGenerator("mdx", {
    description: "Scaffolds MDX file for MYDS docs",
    prompts: [
      {
        type: "list",
        choices: [...docsGroups],
        name: "group",
        message: "Docs MDX for:",
      },
      {
        type: "input",
        name: "title",
        message: "Title:",
        validate: (input: string) => {
          if (!input) {
            return "The page needs a title";
          }
          if (!dashCase(input)) {
            return "The title needs a letter or a digit, to name the page's files";
          }
          return true;
        },
      },
    ],
    actions: [{ type: "write docs page" }],
  });

  // Icon generator. Its action rejects, having changed nothing, if it can't
  // write every icon, and turbo gen prints why.
  plop.setActionType("write icons", (answers, config) =>
    generateIcons({
      root: answers.turbo?.paths?.root,
      framework: config.framework,
    }),
  );

  plop.setGenerator("icon", {
    description: "Builds React component icons from SVG",
    prompts: [
      {
        type: "list",
        choices: ["react"], // vue and angular are not supported yet
        default: "react",
        name: "framework",
        message: "For which library/framework? ",
      },
      // {
      //   type: "input",
      //   name: "title",
      //   message: "Hook name:",
      //   validate: (input: string) => {
      //     if (input.includes(".")) {
      //       return "Component name cannot include an extension";
      //     }
      //     if (input.includes(" ")) {
      //       return "Component name cannot include spaces";
      //     }
      //     if (!input) {
      //       return "Component name is required";
      //     }
      //     return true;
      //   },
      // },
    ],
    actions: (data) => {
      const { framework } = data as ComponentPrompt;
      return [{ type: "write icons", framework }];
    },
  });
}
