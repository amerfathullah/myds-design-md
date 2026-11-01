/**
 * Writes the icon entry's barrel, `index.ts`. The output isn't formatted: the
 * generator formats it with the repository's prettier.
 */

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

/** The barrel that re-exports each icon component, in the order given */
export function barrelIcon(icons: string[]): string {
  const exportStatements = icons
    .map((icon) => `export * from "./${icon}";`)
    .join("\n");

  return [
    nationalMarkImports,
    exportStatements,
    deprecatedNationalMarkExports,
  ].join("\n");
}
