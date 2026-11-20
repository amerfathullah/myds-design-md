// The page masthead.test.mjs renders in Chromium: the Masthead composed as
// the docs compose it, in Malay. The `title` query parameter, when given,
// replaces MastheadTitle's text, and `label`, when given, is the trigger's
// `aria-label`. `data-test` names what the test reads. The test bundles this
// file with esbuild.
import { useEffect } from "react";
import { createRoot } from "react-dom/client";

import {
  Masthead,
  MastheadContent,
  MastheadHeader,
  MastheadSection,
  MastheadTitle,
  MastheadTrigger,
} from "../../react/src/components/masthead";
import { Lock2Icon } from "../../react/src/icons/lock-2";
import { PutrajayaIcon } from "../../react/src/icons/putrajaya";

window.ready = [];

function Page() {
  const params = new URLSearchParams(location.search);
  const title = params.get("title") ?? "Laman Web Rasmi Kerajaan Malaysia";
  // Only a given label names the trigger in place of its text
  const label = params.get("label");
  useEffect(() => void window.ready.push("page"), []);
  return (
    <Masthead data-test="masthead">
      <MastheadHeader>
        <MastheadTitle data-test="title">{title}</MastheadTitle>
        <MastheadTrigger
          data-test="trigger"
          {...(label === null ? {} : { "aria-label": label })}
        >
          Kenal pasti begini
        </MastheadTrigger>
      </MastheadHeader>
      <MastheadContent>
        <MastheadSection
          icon={<PutrajayaIcon />}
          title="Laman web rasmi kerajaan berakhir dengan .gov.my"
        >
          Jika pautan tidak berakhir dengan .gov.my, keluar dari laman web.
        </MastheadSection>
        <MastheadSection
          icon={<Lock2Icon />}
          title="Laman web yang selamat menggunakan HTTPS"
        >
          Cari ikon kunci atau https:// sebagai langkah berjaga-jaga.
        </MastheadSection>
      </MastheadContent>
    </Masthead>
  );
}

createRoot(document.getElementById("root")).render(<Page />);
