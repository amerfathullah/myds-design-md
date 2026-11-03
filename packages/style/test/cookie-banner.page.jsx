// The page cookie-banner.test.mjs renders in Chromium: a button before the
// banner, CookieBanner composed as the docs compose it, then the page frame's
// SkipLink and a main column of controls, the first of which reopens the
// banner. The banner starts open, as on a first visit. Each control logs its
// clicks to `window.clicks`, and the banner its open changes to
// `window.openChanges`. The test bundles this file with esbuild.
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import { Button } from "../../react/src/components/button";
import { Checkbox } from "../../react/src/components/checkbox";
import {
  CookieBanner,
  CookieBannerAction,
  CookieBannerClose,
  CookieBannerDescription,
  CookieBannerPreferences,
  CookieBannerPreferencesTrigger,
  CookieBannerTitle,
} from "../../react/src/components/cookie-banner";
import { Skiplink } from "../../react/src/components/skiplink";

window.clicks = [];
window.openChanges = [];
window.ready = [];

const preferences = [
  [
    "necessary",
    "Necessary",
    "Enable essential site features like secure log-ins and cookies consent settings. We do not store personal data.",
  ],
  [
    "analytics",
    "Analytics",
    "Track metrics like visitor count, bounce rate, and traffic sources.",
  ],
  [
    "performance",
    "Performance",
    "Help analyze key website metrics, improving the user experience.",
  ],
];

// A close control, as the docs render one
function Choice({ children }) {
  return (
    <CookieBannerClose asChild>
      <Button
        variant="primary-fill"
        size="medium"
        className="w-full justify-center sm:w-auto"
      >
        {children}
      </Button>
    </CookieBannerClose>
  );
}

function Banner(props) {
  return (
    <CookieBanner {...props}>
      <CookieBannerTitle>Cookie Preferences</CookieBannerTitle>
      <CookieBannerDescription>
        This website uses cookies to improve user experience. We need your
        consent to use some of the cookies.
      </CookieBannerDescription>
      <CookieBannerPreferences>
        {preferences.map(([id, label, description]) => (
          <div key={id} className="flex flex-row gap-2.5">
            <Checkbox
              id={id}
              defaultChecked
              disabled={id === "necessary"}
              className="mt-0.5 shrink-0"
            />
            <div className="flex flex-col gap-1">
              <label
                htmlFor={id}
                className="text-txt-black-900 text-body-sm font-semibold"
              >
                {label}
              </label>
              <p className="text-txt-black-500 text-body-sm">{description}</p>
            </div>
          </div>
        ))}
      </CookieBannerPreferences>
      <CookieBannerAction>
        <Choice>Accept all</Choice>
        <Choice>Reject all</Choice>
        <CookieBannerPreferencesTrigger>Customise</CookieBannerPreferencesTrigger>
      </CookieBannerAction>
      <CookieBannerAction preferences>
        <CookieBannerPreferencesTrigger>Back</CookieBannerPreferencesTrigger>
        <Choice>Save preferences</Choice>
      </CookieBannerAction>
    </CookieBanner>
  );
}

function Page() {
  const [open, setOpen] = useState(true);
  useEffect(() => void window.ready.push("page"), []);
  const log = (id) => () => window.clicks.push(id);
  return (
    <>
      <button type="button" id="before" onClick={log("before")}>
        Before the banner
      </button>
      <Banner
        open={open}
        onOpenChange={(next) => {
          window.openChanges.push(next);
          setOpen(next);
        }}
      />
      <Skiplink href="#main" id="skip">
        Skip to main content
      </Skiplink>
      <main id="main" tabIndex={-1} className="flex flex-col gap-4 p-4">
        <button
          type="button"
          id="settings"
          className="h-10 text-left"
          onClick={() => {
            log("settings")();
            setOpen(true);
          }}
        >
          Cookie settings
        </button>
        {Array.from({ length: 24 }, (_, index) => (
          <button
            key={index}
            type="button"
            id={`control-${index}`}
            data-control
            className="h-10 text-left"
            onClick={log(`control-${index}`)}
          >
            Control {index + 1}
          </button>
        ))}
      </main>
    </>
  );
}

createRoot(document.getElementById("root")).render(<Page />);
