// The page forced-colours.test.mjs renders in Chromium: each container that
// drew stray outlines under forced colours (#159), rendered by the React
// components themselves, so the page has the classes they really render and
// the layers Radix adds. In DOM order: the CookieBanner, open as on a first
// visit; the Masthead; the Navbar, whose mobile menu NavbarAction opens below
// 1280px; then an Input with addons, a DataTable with its selection column
// and Name column pinned, a Popover and a `multiple` Select with a disabled
// option. The test bundles this file with esbuild. `data-test` names what the
// test focuses or opens, and the elements around those that pass no props to
// their parts; a NavbarMenuItem passes none to its link, so those are named
// by their `href`.
import { useState } from "react";
import { createRoot } from "react-dom/client";

import { Button } from "../../react/src/components/button";
import {
  CookieBanner,
  CookieBannerAction,
  CookieBannerClose,
  CookieBannerDescription,
  CookieBannerTitle,
} from "../../react/src/components/cookie-banner";
import { DataTable } from "../../react/src/components/data-table";
import { Input, InputAddon } from "../../react/src/components/input";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../react/src/components/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../react/src/components/select";
import { Lock2Icon } from "../../react/src/icons/lock-2";
import { PutrajayaIcon } from "../../react/src/icons/putrajaya";

const logo =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='32'%3E%3Crect width='40' height='32' fill='%23a1a1aa'/%3E%3C/svg%3E";

const rows = [
  { id: "r1", name: "Aminah", role: "Officer", unit: "Licensing" },
  { id: "r2", name: "Ben", role: "Clerk", unit: "Records" },
  { id: "r3", name: "Chandra", role: "Head", unit: "Finance" },
];
// Name sorts, so a Button sits next to the pinned columns' edge
const columns = [
  { id: "name", accessorKey: "name", header: "Name", meta: { sortable: true } },
  { id: "role", accessorKey: "role", header: "Role" },
  { id: "unit", accessorKey: "unit", header: "Unit" },
];

// A close control, as the docs render one
function Choice({ children, ...props }) {
  return (
    <CookieBannerClose asChild>
      <Button variant="primary-fill" size="medium" {...props}>
        {children}
      </Button>
    </CookieBannerClose>
  );
}

function Page() {
  // The Popover stays open once opened, so the Navbar's mobile menu and the
  // Select's list, which move focus out of it, can open beside it
  const [popoverOpen, setPopoverOpen] = useState(false);
  return (
    <>
      <CookieBanner defaultOpen data-test="cookie-banner">
        <CookieBannerTitle>Cookie Preferences</CookieBannerTitle>
        <CookieBannerDescription>
          This website uses cookies to improve user experience.
        </CookieBannerDescription>
        <CookieBannerAction>
          <Choice data-test="accept">Accept all</Choice>
          <Choice>Reject all</Choice>
        </CookieBannerAction>
      </CookieBanner>

      <Masthead data-test="masthead">
        <MastheadHeader>
          <MastheadTitle>Official Malaysia Government Website</MastheadTitle>
          <MastheadTrigger data-test="masthead-trigger">
            Here's how you know
          </MastheadTrigger>
        </MastheadHeader>
        <MastheadContent>
          <MastheadSection
            icon={<PutrajayaIcon />}
            title="Official government websites end with .gov.my"
          >
            If the link does not end with .gov.my, exit the website.
          </MastheadSection>
          <MastheadSection
            icon={<Lock2Icon />}
            title="Secure websites use HTTPS"
          >
            Look for a lock or https:// as an added precaution.
          </MastheadSection>
        </MastheadContent>
      </Masthead>

      <Navbar>
        <NavbarLogo src={logo} alt="Agency" href="#logo">
          Agency
        </NavbarLogo>
        <NavbarMenu>
          <NavbarMenuItem href="#home">Home</NavbarMenuItem>
          <NavbarMenuItem href="#services">Services</NavbarMenuItem>
          <NavbarMenuItem href="#contact">Contact</NavbarMenuItem>
        </NavbarMenu>
        <NavbarAction data-test="menu-toggle" />
      </Navbar>

      <main className="flex w-[640px] flex-col items-start gap-6 p-6">
        <div data-test="input-with-addons">
          <Input
            aria-label="Website"
            data-test="input"
            prepend={<InputAddon>https://</InputAddon>}
            append={<InputAddon>.gov.my</InputAddon>}
          />
        </div>

        <div data-test="data-table">
          <DataTable
            columns={columns}
            data={rows}
            selection={{ id_by: "id", mode: "checkbox" }}
            pin={{ left: ["_checkbox", "name"] }}
          />
        </div>

        <Popover
          open={popoverOpen}
          onOpenChange={(open) => open && setPopoverOpen(true)}
        >
          <PopoverTrigger asChild>
            <Button variant="default-outline" data-test="popover-trigger">
              Share
            </Button>
          </PopoverTrigger>
          <PopoverContent data-test="popover">
            <p>Share this page</p>
            <Button variant="primary-fill" data-test="popover-button">
              Copy link
            </Button>
          </PopoverContent>
        </Popover>

        <Select multiple defaultValue={["apple", "banana"]}>
          <SelectTrigger data-test="select-trigger">
            <SelectValue label="Fruit" />
          </SelectTrigger>
          <SelectContent data-test="select-list">
            <SelectItem value="apple" data-test="option-apple">
              Apple
            </SelectItem>
            <SelectItem value="banana" disabled data-test="option-banana">
              Banana
            </SelectItem>
            <SelectItem value="cherry" data-test="option-cherry">
              Cherry
            </SelectItem>
            <SelectItem value="durian" data-test="option-durian">
              Durian
            </SelectItem>
          </SelectContent>
        </Select>
      </main>
    </>
  );
}

createRoot(document.getElementById("root")).render(<Page />);
