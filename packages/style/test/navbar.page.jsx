// The page navbar.test.mjs renders in Chromium: a button before the Navbar,
// the Navbar composed as the docs compose it, with a logo, a menu and
// NavbarAction's toggle, then a main column of controls. The `menu` query
// parameter picks the menu's items, from `menus` below. `data-test` names
// what the test focuses; NavbarMenu renders its items twice, in the desktop
// list and in the mobile menu, so the test tells them apart by where they
// are. The test bundles this file with esbuild.
import { useEffect } from "react";
import { createRoot } from "react-dom/client";

import { Button } from "../../react/src/components/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../react/src/components/dialog";
import {
  Navbar,
  NavbarAction,
  NavbarLogo,
  NavbarMenu,
  NavbarMenuDropdown,
  NavbarMenuItem,
} from "../../react/src/components/navbar";

window.ready = [];

const logo =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='32'%3E%3Crect width='40' height='32' fill='%23a1a1aa'/%3E%3C/svg%3E";

const item = (name) => (
  <NavbarMenuItem key={name} href={`#${name.replace(" ", "-")}`}>
    {name}
  </NavbarMenuItem>
);

const dropdown = (
  <NavbarMenuDropdown key="Dropdown" title="Dropdown">
    {item("Sub C")}
    {item("Sub D")}
  </NavbarMenuDropdown>
);

// An item that isn't a NavbarMenuItem, as an author may put in the menu
const other = (name, control) => (
  <li key={name} className="list-none">
    {control}
  </li>
);

const menus = {
  // The dropdown last
  a: [item("Menu A"), item("Menu B"), dropdown],
  // The dropdown in the middle
  b: [item("Menu A"), dropdown, item("Menu B")],
  // Links only
  c: [item("Menu A"), item("Menu B")],
  // Controls of every kind Tab reaches, and a link the author took out of
  // the tab order
  d: [
    item("Menu A"),
    other("input", <input data-test="input" aria-label="Search" />),
    other(
      "select",
      <select data-test="select" aria-label="Language">
        <option>EN</option>
        <option>BM</option>
      </select>,
    ),
    other(
      "div",
      <div data-test="div" tabIndex={0}>
        Div
      </div>,
    ),
    other(
      "skipped",
      <a data-test="skipped" href="#skipped" tabIndex={-1}>
        Skipped
      </a>,
    ),
    item("Menu B"),
  ],
  // A button that opens the library's Dialog
  dialog: [
    item("Menu A"),
    other(
      "dialog",
      <Dialog>
        <DialogTrigger>
          <Button variant="default-ghost" data-test="open-dialog">
            Open dialog
          </Button>
        </DialogTrigger>
        <DialogBody data-test="dialog">
          <DialogHeader>
            <DialogTitle>Leave the page?</DialogTitle>
          </DialogHeader>
          <DialogContent>
            <DialogDescription>Your changes aren't saved.</DialogDescription>
          </DialogContent>
          <DialogFooter>
            <Button variant="default-outline">Stay</Button>
            <Button variant="danger-fill">Leave</Button>
          </DialogFooter>
        </DialogBody>
      </Dialog>,
    ),
    item("Menu B"),
  ],
};

function Page() {
  const menu = new URLSearchParams(location.search).get("menu") ?? "a";
  useEffect(() => void window.ready.push("page"), []);
  return (
    <>
      <button type="button" data-test="before">
        Before
      </button>
      <Navbar>
        <NavbarLogo src={logo} alt="" href="#logo">
          Agency
        </NavbarLogo>
        <NavbarMenu>{menus[menu]}</NavbarMenu>
        <NavbarAction data-test="toggle" />
      </Navbar>
      <main className="flex flex-col gap-4 p-4">
        <button type="button" data-test="after-1">
          After 1
        </button>
        <button type="button" data-test="after-2">
          After 2
        </button>
      </main>
    </>
  );
}

createRoot(document.getElementById("root")).render(<Page />);
