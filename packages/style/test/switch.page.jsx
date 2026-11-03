// The page switch.test.mjs renders in Chromium: Switches (Toggle and
// ToggleThumb) in a form with a submit button, inside a disabled fieldset
// without their own `disabled`, and with `disabled`. It renders them twice:
// in `#csr` on the client, and in `#ssr` from server HTML that React
// hydrates. Each Switch logs what it reports to `window.changes`, and each
// form its submits to `window.submits`. The test bundles this file with
// esbuild.
import { useEffect } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";

import { Label } from "../../react/src/components/label";
import { Toggle, ToggleThumb } from "../../react/src/components/toggle";

window.changes = [];
window.submits = [];
window.recoverableErrors = [];
// The modes React has committed, so hydrated, in
window.ready = [];

// A labelled Switch with the id `id`, which logs each change it reports
function Switch({ id, label, ...props }) {
  return (
    <div style={{ display: "flex", gap: 16, margin: "16px 0", width: 320 }}>
      <Label htmlFor={id} data-test={`${id}-label`}>
        {label}
      </Label>
      <Toggle
        id={id}
        onCheckedChange={(checked) => window.changes.push({ id, checked })}
        {...props}
      >
        <ToggleThumb />
      </Toggle>
    </div>
  );
}

// The fixtures, their ids prefixed with `mode`
function Fixtures({ mode }) {
  useEffect(() => void window.ready.push(mode), [mode]);
  return (
    <section>
      <form
        id={`${mode}-form`}
        onSubmit={(event) => {
          event.preventDefault();
          window.submits.push(mode);
        }}
      >
        <input id={`${mode}-text`} aria-label="Name" />
        <Switch id={`${mode}-switch`} label="Enable sync" />
        <button type="submit">Save</button>
      </form>

      <button data-test={`${mode}-before`}>Before</button>
      <fieldset disabled id={`${mode}-fieldset`}>
        <Switch id={`${mode}-fieldset-switch`} label="Share my data" />
      </fieldset>
      <button data-test={`${mode}-after`}>After</button>

      <Switch id={`${mode}-disabled-switch`} label="Locked" disabled />
    </section>
  );
}

createRoot(document.getElementById("csr")).render(<Fixtures mode="csr" />);

const ssr = document.getElementById("ssr");
const tree = <Fixtures mode="ssr" />;
ssr.innerHTML = renderToString(tree);
// The server's inputs, so the test can tell that hydration kept them
window.serverInputs = [...ssr.querySelectorAll("input")];
hydrateRoot(ssr, tree, {
  onRecoverableError: (error) => window.recoverableErrors.push(String(error)),
});
