import * as fs from "fs";
import * as path from "path";
import { icon_directory } from "./util";

interface MainScriptProps {
  framework: "react" | "vue" | "angular";
}

// National marks aren't icons (ADR-0007). Their components sit outside the
// icon directory and their SVGs outside the icon sources, so the convert step
// never writes them and the export statements below never pick them up. Until
// the next major, the entry still exports both under their old names,
// deprecated, so the barrel writes those two exports itself.
const nationalMarkImports = `import type { FunctionComponent, SVGProps } from "react";

import { JataNegara } from "../national-marks/legacy-jata-negara";
import { MalaysiaFlag } from "../national-marks/malaysia-flag";
`;

const deprecatedNationalMarkExports = `
/**
 * The Jata Negara, 32×32 in full colour.
 *
 * @deprecated The Jata Negara is a national mark, and only an official service
 * may show one. An official service that shows it supplies the image itself,
 * through the Navbar or Footer logo slot. \`JataNegaraIcon\` will be removed from
 * \`@amerfathullah/myds-react/icon\` in the next major version.
 */
export const JataNegaraIcon: FunctionComponent<SVGProps<SVGSVGElement>> =
  JataNegara;

/**
 * The Malaysia flag, 32×16 in full colour.
 *
 * @deprecated The Malaysia flag is a national mark, and only an official
 * service may show one. The Masthead already shows it. \`MalaysiaFlagIcon\` will
 * be removed from \`@amerfathullah/myds-react/icon\` in the next major version.
 */
export const MalaysiaFlagIcon: FunctionComponent<SVGProps<SVGSVGElement>> =
  MalaysiaFlag;
`;

export default (props: MainScriptProps) => {
  try {
    const icon_dir = path.resolve(__dirname, icon_directory[props.framework]);
    // Get all files in the icons directory
    const files = fs.readdirSync(icon_dir);
    // Filter out non-TypeScript files
    const tsx_files = files.filter((file) => file.endsWith(".tsx"));

    // Generate export statements
    const exportStatements = tsx_files
      .map((file) => {
        const fileNameWithoutExtension = path.basename(file, ".tsx");
        return `export * from './${fileNameWithoutExtension}';`;
      })
      .join("\n");

    // Write export statements to index.ts
    fs.writeFileSync(
      path.join(icon_dir, "index.ts"),
      [
        nationalMarkImports,
        exportStatements,
        deprecatedNationalMarkExports,
      ].join("\n"),
    );
    console.log("Barrel file created successfully.");
  } catch (error) {
    console.error("Error creating barrel file: ", error);
  }
};
