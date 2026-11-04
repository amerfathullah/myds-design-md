// The page date-pickers.test.mjs renders in Chromium: DatePickers and
// DateRangePickers named by a Label through `aria-labelledby`, described by a
// hint, named by `aria-label`, and with no naming props. Each picker sits in
// a `<div data-test>` of its own. The page renders them twice: in `#csr` on
// the client, and in `#ssr` from server HTML that React hydrates. The test
// bundles this file with esbuild.
import { useEffect } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";

import { DatePicker } from "../../react/src/components/date-picker";
import { DateRangePicker } from "../../react/src/components/daterange-picker";
import { Label } from "../../react/src/components/label";

window.recoverableErrors = [];
// The roots React has committed, so hydrated, in
window.ready = [];

const october1 = new Date(2026, 9, 1);
const october30 = new Date(2026, 9, 30);
const range = { from: october1, to: october30 };

// The picker `children` in a box `<mode>-<name>`
function Field({ mode, name, children }) {
  return (
    <div
      data-test={`${mode}-${name}`}
      style={{ display: "flex", flexDirection: "column", gap: 8, margin: 16 }}
    >
      {children}
    </div>
  );
}

// The fixtures, their ids and `data-test`s prefixed with `mode`
function Fixtures({ mode }) {
  useEffect(() => void window.ready.push(mode), [mode]);
  return (
    <section>
      <Field mode={mode} name="date-labelled">
        <Label id={`${mode}-dob`}>Date of birth</Label>
        <p id={`${mode}-dob-hint`}>No earlier than 1 January 1950</p>
        <DatePicker
          value={october30}
          aria-labelledby={`${mode}-dob`}
          aria-describedby={`${mode}-dob-hint`}
        />
      </Field>
      <Field mode={mode} name="date-aria-label">
        <DatePicker value={october30} locale="ms" aria-label="Tarikh lahir" />
      </Field>
      <Field mode={mode} name="date-unnamed">
        <DatePicker value={october30} />
      </Field>
      <Field mode={mode} name="range-labelled">
        <Label id={`${mode}-travel`}>Travel dates</Label>
        <p id={`${mode}-travel-hint`}>Up to 30 days</p>
        <DateRangePicker
          value={range}
          aria-labelledby={`${mode}-travel`}
          aria-describedby={`${mode}-travel-hint`}
        />
      </Field>
      <Field mode={mode} name="range-aria-label">
        <DateRangePicker
          value={range}
          locale="ms"
          aria-label="Tarikh perjalanan"
        />
      </Field>
      <Field mode={mode} name="range-from-to">
        <Label id={`${mode}-stay`}>Stay</Label>
        <DateRangePicker
          value={range}
          fromLabel="Check-in:"
          toLabel="Check-out:"
          aria-labelledby={`${mode}-stay`}
        />
      </Field>
      <Field mode={mode} name="range-unnamed">
        <DateRangePicker value={range} />
      </Field>
    </section>
  );
}

createRoot(document.getElementById("csr")).render(<Fixtures mode="csr" />);

const ssr = document.getElementById("ssr");
const tree = <Fixtures mode="ssr" />;
ssr.innerHTML = renderToString(tree);
// The server's triggers, so the test can tell that hydration kept them
window.serverTriggers = [...ssr.querySelectorAll("button")];
hydrateRoot(ssr, tree, {
  onRecoverableError: (error) => window.recoverableErrors.push(String(error)),
});
