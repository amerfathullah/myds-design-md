// The page switch.test.mjs renders in Chromium: Switches (Toggle and
// ToggleThumb) in a form with a submit button, in a disabled fieldset without
// their own `disabled`, in a fieldset the test disables later, and with
// `disabled`. It renders them twice: in `#csr` on the client, and in `#ssr`
// from server HTML that React hydrates. Each Switch logs what it reports to
// `window.changes`, and each form the ids of its submits to `window.submits`.
// `#looks` holds a Switch of each size and state, for the test of their look.
// The test bundles this file with esbuild.
import { useEffect } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";

import { Label } from "../../react/src/components/label";
import { Toggle, ToggleThumb } from "../../react/src/components/toggle";

window.changes = [];
window.submits = [];
window.recoverableErrors = [];
// The roots React has committed, so hydrated, in
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

// A form `id`-form, which logs its submits
function Form({ id, children }) {
  return (
    <form
      id={`${id}-form`}
      onSubmit={(event) => {
        event.preventDefault();
        window.submits.push(event.currentTarget.id);
      }}
    >
      {children}
    </form>
  );
}

// The Switch `id` in a fieldset `id`-fieldset, between buttons that don't
// submit its form, `id`-before and `id`-after, and before one that does
function InFieldset({ id, label, disabled }) {
  return (
    <Form id={id}>
      <button type="button" data-test={`${id}-before`}>
        Before
      </button>
      <fieldset disabled={disabled} id={`${id}-fieldset`}>
        <Switch id={id} label={label} />
      </fieldset>
      <button type="button" data-test={`${id}-after`}>
        After
      </button>
      <button type="submit">Save</button>
    </Form>
  );
}

// The fixtures, their ids prefixed with `mode`
function Fixtures({ mode }) {
  useEffect(() => void window.ready.push(mode), [mode]);
  return (
    <section>
      <Form id={`${mode}-switch`}>
        <input id={`${mode}-text`} aria-label="Name" />
        <Switch id={`${mode}-switch`} label="Enable sync" />
        <button type="submit" data-test={`${mode}-submit`}>
          Save
        </button>
      </Form>

      <InFieldset id={`${mode}-in-fieldset`} label="Share my data" disabled />
      {/* The test disables this fieldset once the Switch has had focus */}
      <InFieldset id={`${mode}-late`} label="Pemberitahuan e-mel" />

      <Switch id={`${mode}-disabled`} label="Locked" disabled />
    </section>
  );
}

// The states of the Switches in `#looks`, and their props
const lookStates = {
  unchecked: {},
  checked: { defaultChecked: true },
  disabled: { disabled: true },
  "disabled-checked": { disabled: true, defaultChecked: true },
};

// A Switch `look-<size>-<state>` of each size and state, a row for each size
function Looks() {
  useEffect(() => void window.ready.push("looks"), []);
  return (
    <section>
      {["small", "medium", "large"].map((size) => (
        <div key={size} style={{ display: "flex", gap: 32, margin: 16 }}>
          {Object.entries(lookStates).map(([state, props]) => (
            <Toggle
              key={state}
              id={`look-${size}-${state}`}
              size={size}
              {...props}
            >
              <ToggleThumb aria-label={`${size}, ${state}`} />
            </Toggle>
          ))}
        </div>
      ))}
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

createRoot(document.getElementById("looks")).render(<Looks />);
