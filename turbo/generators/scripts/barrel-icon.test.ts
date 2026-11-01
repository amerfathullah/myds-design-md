import { expect, test } from "vitest";

import { barrelIcon } from "./barrel-icon";

const barrel = barrelIcon(["check-circle-fill", "check-circle", "rss"]);

test("re-exports every icon, in the order given", () => {
  expect(barrel).toContain(
    [
      `export * from "./check-circle-fill";`,
      `export * from "./check-circle";`,
      `export * from "./rss";`,
    ].join("\n"),
  );
});

// National marks aren't icons (ADR-0007): their components sit outside the
// icon directory, and the entry exports them, deprecated, until the next major.
test("exports both national marks under their deprecated names", () => {
  expect(barrel).toContain(
    `import { JataNegara } from "../national-marks/legacy-jata-negara";`,
  );
  expect(barrel).toContain(
    `import { MalaysiaFlag } from "../national-marks/malaysia-flag";`,
  );
  expect(barrel).toMatch(
    /@deprecated The Jata Negara is a national mark[^]*export const JataNegaraIcon: FunctionComponent<SVGProps<SVGSVGElement>> =\n {2}JataNegara;/,
  );
  expect(barrel).toMatch(
    /@deprecated The Malaysia flag is a national mark[^]*export const MalaysiaFlagIcon: FunctionComponent<SVGProps<SVGSVGElement>> =\n {2}MalaysiaFlag;/,
  );
});
