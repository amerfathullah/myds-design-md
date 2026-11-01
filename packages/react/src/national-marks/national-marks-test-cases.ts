/**
 * The national marks as the tests know them: each mark's own component, the
 * deprecated name `@amerfathullah/myds-react/icon` exports it under until the
 * next major (ADR-0007), and the files behind it. Shared by the source test
 * and the built-package test.
 */
import type { FunctionComponent, SVGProps } from "react";

import { JataNegara } from "./legacy-jata-negara";
import { MalaysiaFlag } from "./malaysia-flag";

export interface NationalMark {
  /** The component's own name, which no public entry exports */
  privateName: string;
  /** The deprecated name `/icon` exports it under */
  iconExport: string;
  /** The base name of its component here and of its SVG in `svg/national-marks` */
  file: string;
  component: FunctionComponent<SVGProps<SVGSVGElement>>;
  /** What its `/icon` deprecation note says that the other mark's doesn't */
  note: RegExp;
}

export const marks: NationalMark[] = [
  {
    privateName: "MalaysiaFlag",
    iconExport: "MalaysiaFlagIcon",
    file: "malaysia-flag",
    component: MalaysiaFlag,
    note: /\bThe Masthead already shows it\b/,
  },
  {
    privateName: "JataNegara",
    iconExport: "JataNegaraIcon",
    file: "legacy-jata-negara",
    component: JataNegara,
    note: /\bsupplies the image itself, through the Navbar or Footer logo slot\b/,
  },
];

/** The class the Masthead's header gives the flag */
export const mastheadFlagClass = "inline-block aspect-auto w-fit shrink-0";
