// The page callout.test.mjs renders in Chromium: a callout for each Variant,
// one with `variant` left out, and a `dismissible` `danger` one, each with a
// CalloutContent and a title that names its Variant, as the docs title them.
// They render twice: in `#client`, mounted on the client, and in `#server`,
// as server markup that isn't hydrated, as a browser shows it before the
// page hydrates. Each callout's root has `data-test="<mode>-<name>"`, such
// as `client-danger`. The test bundles this file with esbuild.
import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";

import {
  Callout,
  CalloutContent,
  CalloutTitle,
} from "../../react/src/components/callout";

window.ready = [];

const information = {
  title: "Maklumat: Permohonan sedang disemak",
  content: "Kami akan menghubungi anda dalam masa lima hari bekerja.",
};
const error = {
  title: "Ralat: Borang tidak dihantar",
  content: "Semak butiran anda dan cuba lagi.",
};

// The callouts, by name: their props, title and content
const callouts = {
  omitted: { props: {}, ...information },
  info: { props: { variant: "info" }, ...information },
  success: {
    props: { variant: "success" },
    title: "Berjaya: Data disimpan",
    content: "Perubahan anda telah disimpan.",
  },
  warning: {
    props: { variant: "warning" },
    title: "Amaran: Sesi akan tamat",
    content: "Sesi anda akan tamat dalam masa lima minit.",
  },
  danger: { props: { variant: "danger" }, ...error },
  "dismissible-danger": {
    props: { variant: "danger", dismissible: true },
    ...error,
  },
};

function Callouts({ mode }) {
  return (
    <div className="space-y-2 p-4">
      {Object.entries(callouts).map(([name, { props, title, content }]) => (
        <Callout key={name} data-test={`${mode}-${name}`} {...props}>
          <CalloutTitle>{title}</CalloutTitle>
          <CalloutContent>{content}</CalloutContent>
        </Callout>
      ))}
    </div>
  );
}

function Page() {
  useEffect(() => void window.ready.push("page"), []);
  return <Callouts mode="client" />;
}

document.getElementById("server").innerHTML = renderToStaticMarkup(
  <Callouts mode="server" />,
);
createRoot(document.getElementById("client")).render(<Page />);
