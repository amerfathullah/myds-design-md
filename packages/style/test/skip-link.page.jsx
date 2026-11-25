// The page skip-link.test.mjs renders in Chromium: the page frame, SkipLink,
// then the Masthead with its trigger and the Navbar, then a `<main>` taller
// than the window, which the skip link points at. With `?banner` in its URL,
// a CookieBanner comes first and starts open, as on a first visit.
// `data-test` names what the test reads. The test bundles this file with
// esbuild.
import { useEffect } from "react";
import { createRoot } from "react-dom/client";

import { Button } from "../../react/src/components/button";
import {
  CookieBanner,
  CookieBannerAction,
  CookieBannerClose,
  CookieBannerDescription,
  CookieBannerTitle,
} from "../../react/src/components/cookie-banner";
import {
  Masthead,
  MastheadHeader,
  MastheadTitle,
  MastheadTrigger,
} from "../../react/src/components/masthead";
import {
  Navbar,
  NavbarAction,
  NavbarLogo,
  NavbarMenu,
  NavbarMenuItem,
} from "../../react/src/components/navbar";
import { Skiplink } from "../../react/src/components/skiplink";

window.ready = [];

const logo =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='32'%3E%3Crect width='40' height='32' fill='%23a1a1aa'/%3E%3C/svg%3E";

// A close control, as the docs render one
function Choice({ children }) {
  return (
    <CookieBannerClose asChild>
      <Button variant="primary-fill" size="medium">
        {children}
      </Button>
    </CookieBannerClose>
  );
}

function Page() {
  const banner = new URLSearchParams(location.search).has("banner");
  useEffect(() => void window.ready.push("page"), []);
  return (
    <>
      {banner && (
        <CookieBanner defaultOpen>
          <CookieBannerTitle>Cookie Preferences</CookieBannerTitle>
          <CookieBannerDescription>
            This website uses cookies to improve user experience.
          </CookieBannerDescription>
          <CookieBannerAction>
            <Choice>Accept all</Choice>
            <Choice>Reject all</Choice>
          </CookieBannerAction>
        </CookieBanner>
      )}
      <Skiplink href="#main-content" data-test="skip">
        Skip to main content
      </Skiplink>
      <Masthead>
        <MastheadHeader>
          <MastheadTitle>Official Malaysian Government Website</MastheadTitle>
          <MastheadTrigger>Here&apos;s how you know</MastheadTrigger>
        </MastheadHeader>
      </Masthead>
      <Navbar>
        <NavbarLogo src={logo} alt="" href="#logo">
          Agency
        </NavbarLogo>
        <NavbarMenu>
          <NavbarMenuItem href="#menu-1">Menu 1</NavbarMenuItem>
          <NavbarMenuItem href="#menu-2">Menu 2</NavbarMenuItem>
        </NavbarMenu>
        <NavbarAction />
      </Navbar>
      <main id="main-content" tabIndex={-1} className="h-[3000px] p-4">
        <h1>Apply for a licence</h1>
        <input aria-label="Search" />
      </main>
    </>
  );
}

createRoot(document.getElementById("root")).render(<Page />);
