// The page pill.test.mjs renders in Chromium: forms that each hold a text
// field and two dismissible pills, "Kuala Lumpur" and "Johor", as a tags
// field shows them. The forms differ in their layout, and in what their
// pills' `onDismiss` does:
// - `field-first`: the text field, the pills, then the form's own submit
//   button;
// - `field-last`: the pills, the text field, then the form's own submit
//   button;
// - `no-submit`: the text field and the pills, and no submit button;
// - `removes`: `onDismiss` removes its pill, as a tags field does;
// - `keeps`: `onDismiss` only records the call, and the pill stays.
// Each form has `data-test="<layout>-<onDismiss>"`, such as
// `field-first-removes`. A form logs its submits to `window.submits`, by
// their submitter's `data-test` or name, and cancels them. Each pill logs its
// `onDismiss` calls to `window.dismissals`. The test bundles this file with
// esbuild.
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import { Pill } from "../../react/src/components/pill";

window.ready = [];
window.submits = [];
window.dismissals = [];

const states = ["Kuala Lumpur", "Johor"];

const layouts = ["field-first", "field-last", "no-submit"];
const onDismissModes = ["removes", "keeps"];

function TagsForm({ layout, onDismissMode }) {
  const form = `${layout}-${onDismissMode}`;
  const [shown, setShown] = useState(states);
  const field = <input type="text" aria-label="Catatan" />;
  return (
    <form
      data-test={form}
      onSubmit={(event) => {
        event.preventDefault();
        const { submitter } = event.nativeEvent;
        window.submits.push({
          form,
          submitter: submitter
            ? (submitter.dataset.test ?? submitter.getAttribute("aria-label"))
            : null,
        });
      }}
    >
      {layout !== "field-last" && field}
      {shown.map((state) => (
        <Pill
          key={state}
          closeLabel={`Buang ${state}`}
          onDismiss={() => {
            window.dismissals.push({ form, state });
            if (onDismissMode === "removes")
              setShown((previous) => previous.filter((pill) => pill !== state));
          }}
        >
          {state}
        </Pill>
      ))}
      {layout === "field-last" && field}
      {layout !== "no-submit" && (
        <button type="submit" data-test="submit">
          Hantar
        </button>
      )}
    </form>
  );
}

function Page() {
  useEffect(() => {
    window.ready.push("page");
  }, []);
  return (
    <main style={{ padding: 16, display: "grid", gap: 16 }}>
      {layouts.flatMap((layout) =>
        onDismissModes.map((onDismissMode) => (
          <TagsForm
            key={`${layout}-${onDismissMode}`}
            layout={layout}
            onDismissMode={onDismissMode}
          />
        )),
      )}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<Page />);
