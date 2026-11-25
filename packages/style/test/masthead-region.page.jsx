// The page masthead-region.test.mjs renders in Chromium: the page frame,
// SkipLink, Masthead, Navbar, a `<main>` and Footer, in English or, with
// `?lang=ms`, in Malay. The Masthead follows the documented recipe: it's
// `role="region"`, and its `aria-labelledby` points at its MastheadTitle's
// `id`. Its texts are the develop docs' example, on the English or the Malay
// page. `window.masthead` is the element Masthead's ref gets. `data-test`
// names what the test reads. The test bundles this file with esbuild.
import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

import {
  Footer,
  FooterSection,
  SiteInfo,
  SiteLink,
  SiteLinkGroup,
} from "../../react/src/components/footer";
import {
  Masthead,
  MastheadContent,
  MastheadHeader,
  MastheadSection,
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
import { Lock2Icon } from "../../react/src/icons/lock-2";
import { LockFillIcon } from "../../react/src/icons/lock-fill";
import { PutrajayaIcon } from "../../react/src/icons/putrajaya";

window.ready = [];

const logo =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='32'%3E%3Crect width='40' height='32' fill='%23a1a1aa'/%3E%3C/svg%3E";

const texts = {
  en: {
    skip: "Skip to main content",
    title: "Official Malaysian Government Website",
    trigger: "Here's how you know",
    official: "Official government websites end with .gov.my",
    exit: (
      <>
        If the link does not end with <b>.gov.my</b>, exit the website
        immediately even if it looks similar.
      </>
    ),
    secure: "Secure websites use HTTPS",
    lock: (
      <>
        Look for a lock (<LockFillIcon className="inline-block size-3.5" />) or
        https:// as an added precaution. If not present, do not share any
        sensitive information.
      </>
    ),
    agency: "Agency",
    home: "Home",
    services: "Services",
    heading: "Apply for a licence",
    body: "Check what you need before you start.",
    about: "About us",
    links: "Links",
  },
  ms: {
    skip: "Langkau ke kandungan utama",
    title: "Portal Rasmi Kerajaan Malaysia",
    trigger: "Kenal pasti begini",
    official: "Laman web rasmi kerajaan berakhir dengan .gov.my",
    exit: (
      <>
        Jika pautan tidak berakhir dengan <b>.gov.my</b>, keluar dari laman web
        dengan segera walaupun ia kelihatan serupa.
      </>
    ),
    secure: "Laman web yang selamat menggunakan HTTPS",
    lock: (
      <>
        Cari kunci (<LockFillIcon className="inline-block size-3.5" />) atau
        https:// sebagai langkah berjaga-jaga tambahan. Jika tidak ada, jangan
        kongsi sebarang maklumat sensitif.
      </>
    ),
    agency: "Agensi",
    home: "Utama",
    services: "Perkhidmatan",
    heading: "Mohon lesen",
    body: "Semak apa yang anda perlukan sebelum bermula.",
    about: "Tentang kami",
    links: "Pautan",
  },
};

function Page() {
  const t = texts[new URLSearchParams(location.search).get("lang") ?? "en"];
  const masthead = useRef(null);
  useEffect(() => {
    window.masthead = masthead.current;
    window.ready.push("page");
  }, []);
  return (
    <>
      <Skiplink href="#main">
        <span>{t.skip}</span>
      </Skiplink>
      <Masthead ref={masthead} role="region" aria-labelledby="masthead-title">
        <MastheadHeader>
          <MastheadTitle id="masthead-title" data-test="title">
            {t.title}
          </MastheadTitle>
          <MastheadTrigger data-test="trigger">{t.trigger}</MastheadTrigger>
        </MastheadHeader>
        <MastheadContent>
          <MastheadSection icon={<PutrajayaIcon />} title={t.official}>
            {t.exit}
          </MastheadSection>
          <MastheadSection
            icon={<Lock2Icon className="inline-block size-3.5" />}
            title={t.secure}
          >
            {t.lock}
          </MastheadSection>
        </MastheadContent>
      </Masthead>
      <Navbar>
        <NavbarLogo src={logo} alt="" href="#logo">
          {t.agency}
        </NavbarLogo>
        <NavbarMenu>
          <NavbarMenuItem href="#home">{t.home}</NavbarMenuItem>
          <NavbarMenuItem href="#services">{t.services}</NavbarMenuItem>
        </NavbarMenu>
        <NavbarAction />
      </Navbar>
      <main id="main" className="p-4">
        <h1>{t.heading}</h1>
        <p>{t.body}</p>
      </main>
      <Footer>
        <FooterSection>
          <SiteInfo>
            <p>{t.agency}</p>
          </SiteInfo>
          <SiteLinkGroup groupTitle={t.links}>
            <SiteLink href="#about">{t.about}</SiteLink>
          </SiteLinkGroup>
        </FooterSection>
      </Footer>
    </>
  );
}

createRoot(document.getElementById("root")).render(<Page />);
