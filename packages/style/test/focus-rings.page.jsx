// The page focus-rings.test.mjs renders in Chromium: every control whose
// focus ring or outline the test checks, rendered by the React components
// themselves, so the page has the classes they really render and the tab
// stops Radix adds. Most are in the main column. Beside it are two Buttons,
// an Input, a Checkbox, a Dropdown, a Popover and a Select, whose lists and
// panel open there too, and a CookieBanner. The test bundles this file with
// esbuild. `data-test` names what the test focuses; a NavbarMenuItem passes
// no props to its link, so those are named by their `href`.
import { createRoot } from "react-dom/client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../react/src/components/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../react/src/components/breadcrumb";
import { Button } from "../../react/src/components/button";
import { Checkbox } from "../../react/src/components/checkbox";
import {
  CookieBanner,
  CookieBannerDescription,
  CookieBannerTitle,
} from "../../react/src/components/cookie-banner";
import { DataTable } from "../../react/src/components/data-table";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "../../react/src/components/dropdown";
import { SiteLink, SiteLinkGroup } from "../../react/src/components/footer";
import { Input } from "../../react/src/components/input";
import { InputOTP, InputOTPSlot } from "../../react/src/components/input-otp";
import { Label } from "../../react/src/components/label";
import { Link } from "../../react/src/components/link";
import {
  Navbar,
  NavbarLogo,
  NavbarMenu,
  NavbarMenuDropdown,
  NavbarMenuItem,
} from "../../react/src/components/navbar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../react/src/components/popover";
import {
  Radio,
  RadioButton,
  RadioItem,
  RadioLabel,
} from "../../react/src/components/radio";
import {
  SearchBar,
  SearchBarInput,
  SearchBarInputContainer,
} from "../../react/src/components/search-bar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../react/src/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableTooltip,
} from "../../react/src/components/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../react/src/components/tabs";
import {
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewport,
} from "../../react/src/components/toast";
import { Toggle, ToggleThumb } from "../../react/src/components/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../react/src/components/tooltip";

const logo =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='32'%3E%3Crect width='40' height='32' fill='%23a1a1aa'/%3E%3C/svg%3E";

// Three rows of three columns, so a table has a first and a last row and
// column, and an interior cell
const rows = [
  { id: "r1", name: "Aminah", role: "Officer", unit: "Licensing" },
  { id: "r2", name: "Ben", role: "Clerk", unit: "Records" },
  { id: "r3", name: "Chandra", role: "Head", unit: "Finance" },
];
const columns = ["name", "role", "unit"].map((key) => ({
  id: key,
  accessorKey: key,
  header: key,
}));

// Space around each control, so its ring, and the pixels just outside it,
// fall on the page's own background
const gap = { margin: "24px 0" };

function Page() {
  return (
    <>
      <Navbar>
        <NavbarLogo src={logo} alt="Agency" href="#logo">
          Agency
        </NavbarLogo>
        <NavbarMenu>
          <NavbarMenuItem href="#nav-item">Home</NavbarMenuItem>
          <NavbarMenuItem href="#nav-item-as-child" asChild>
            <a href="#nav-item-as-child">About</a>
          </NavbarMenuItem>
          <NavbarMenuDropdown title="Services">
            <NavbarMenuItem href="#nav-dropdown-item">Apply</NavbarMenuItem>
            <NavbarMenuItem href="#nav-dropdown-item-2">Renew</NavbarMenuItem>
          </NavbarMenuDropdown>
        </NavbarMenu>
      </Navbar>

      <main style={{ padding: "24px 32px", width: 720 }}>
        <p style={gap}>
          <Link href="#link" data-test="link">
            Link
          </Link>
        </p>
        <p style={{ ...gap, width: 96, lineHeight: "40px" }}>
          <Link href="#link-wrap" data-test="link-wrap">
            Wrapping link
          </Link>
        </p>

        <div style={gap}>
          <SiteLinkGroup groupTitle="Site">
            <SiteLink href="#site-link" data-test="site-link">
              Site link
            </SiteLink>
            <SiteLink asChild>
              <a href="#site-link-as-child" data-test="site-link-as-child">
                Site link as child
              </a>
            </SiteLink>
          </SiteLinkGroup>
        </div>

        <div style={gap}>
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink href="#crumb" data-test="crumb">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#crumb-long" data-test="crumb-long">
                A breadcrumb link longer than its item's maximum width
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Page</BreadcrumbPage>
            </BreadcrumbItem>
          </Breadcrumb>
        </div>

        <div style={{ ...gap, width: 400 }}>
          <Accordion type="multiple" defaultValue={["open"]}>
            <AccordionItem value="closed">
              <AccordionTrigger data-test="accordion-closed">
                Closed item
              </AccordionTrigger>
              <AccordionContent>Hidden</AccordionContent>
            </AccordionItem>
            <AccordionItem value="open">
              <AccordionTrigger data-test="accordion-open">
                Open item
              </AccordionTrigger>
              <AccordionContent>
                Content with{" "}
                <Link href="#accordion-link" data-test="accordion-link">
                  a link
                </Link>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div style={{ ...gap, display: "flex", gap: 24 }}>
          <Tooltip>
            <TooltipTrigger data-test="tooltip">Bare</TooltipTrigger>
            <TooltipContent>Tip</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                data-test="tooltip-as-child"
                className="focus-visible:ring-fr-primary rounded-sm focus-visible:ring-2 focus-visible:outline-hidden"
              >
                As child
              </button>
            </TooltipTrigger>
            <TooltipContent>Tip</TooltipContent>
          </Tooltip>
        </div>

        <div style={gap}>
          <Tabs defaultValue="one">
            <TabsList>
              <TabsTrigger value="one" data-test="tabs-trigger">
                One
              </TabsTrigger>
              <TabsTrigger value="two">Two</TabsTrigger>
            </TabsList>
            <TabsContent value="one" data-test="tabs-panel" style={gap}>
              Panel one
            </TabsContent>
            <TabsContent value="two">Panel two</TabsContent>
          </Tabs>
        </div>

        <div style={{ ...gap, display: "flex", gap: 32 }}>
          {["small", "medium", "large"].map((size) => (
            <Radio key={size} size={size} defaultValue="a">
              <RadioItem>
                <RadioButton
                  value="a"
                  id={`radio-${size}`}
                  data-test={`radio-${size}`}
                />
                <RadioLabel htmlFor={`radio-${size}`}>{size}</RadioLabel>
              </RadioItem>
            </Radio>
          ))}
        </div>

        <div style={{ ...gap, display: "flex", gap: 16, width: 320 }}>
          <Label htmlFor="switch">Enable sync</Label>
          <Toggle id="switch">
            <ToggleThumb />
          </Toggle>
        </div>

        <div style={{ ...gap, width: 320 }}>
          <SearchBar>
            <SearchBarInputContainer data-test="search-bar">
              <SearchBarInput placeholder="Search" />
            </SearchBarInputContainer>
          </SearchBar>
        </div>

        <div style={{ ...gap, display: "flex", gap: 32 }}>
          {[false, true].map((invalid) => (
            <InputOTP
              key={String(invalid)}
              maxLength={3}
              invalid={invalid}
              data-test={invalid ? "otp-invalid" : "otp"}
            >
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTP>
          ))}
        </div>

        <div style={gap} data-test="table">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(({ id }, column) => (
                  <TableHead key={id}>
                    <div className="flex items-center gap-1">
                      {id}
                      {column === 0 && <TableTooltip>Help</TableTooltip>}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, r) => (
                <TableRow key={row.id}>
                  {columns.map(({ id }, c) => (
                    <TableCell key={id} data-cell={`${r}-${c}`}>
                      {row[id]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div style={gap} data-test="data-table">
          <DataTable
            columns={columns}
            data={rows}
            selection={{ id_by: "id", mode: "radio" }}
          />
        </div>
      </main>

      {/* Beside the main column, below the Navbar and above the pointer's
          resting place: controls that ring on `focus:`, then a Dropdown, a
          Popover and a Select, whose lists and panel open below them. The
          Select's trigger comes last, as picking an option resizes it. */}
      <div style={{ position: "absolute", top: 96, left: 800, width: 560 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Button variant="primary-fill" data-test="button-primary">
            Primary
          </Button>
          <Button variant="default-outline" data-test="button-outline">
            Outline
          </Button>
          <Checkbox aria-label="Agree" data-test="checkbox" />
        </div>
        <div style={{ ...gap, width: 240 }}>
          <Input aria-label="Name" placeholder="Name" data-test="input" />
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <Dropdown>
            <DropdownTrigger asChild>
              <Button variant="default-outline" data-test="dropdown-trigger">
                Actions
              </Button>
            </DropdownTrigger>
            <DropdownContent>
              <DropdownItem>Edit</DropdownItem>
              <DropdownItem data-test="dropdown-item">Copy</DropdownItem>
              <DropdownItem>Delete</DropdownItem>
            </DropdownContent>
          </Dropdown>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="default-outline" data-test="popover-trigger">
                Details
              </Button>
            </PopoverTrigger>
            {/* Nothing in it takes focus, so Radix focuses the panel */}
            <PopoverContent data-test="popover">
              Text, with nothing to tab to
            </PopoverContent>
          </Popover>
          <Select>
            <SelectTrigger aria-label="Fruit" data-test="select-trigger">
              <SelectValue placeholder="Fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana" data-test="select-item">
                Banana
              </SelectItem>
              <SelectItem value="cherry">Cherry</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Fixed below those, clear of every other control. While it's shown,
          the banner pads the page's bottom by its height, which would make
          the page taller than the viewport, so that focus could scroll it.
          Nothing here sits under the banner, so the padding is undone. */}
      <style>
        {
          "html{scroll-padding-bottom:0!important}body{padding-bottom:0!important}"
        }
      </style>
      <CookieBanner
        defaultOpen
        closeLabel="Close cookie banner"
        className="top-[440px] bottom-auto"
        data-test="cookie-banner"
      >
        <CookieBannerTitle>Cookies</CookieBannerTitle>
        <CookieBannerDescription>
          This website uses cookies to improve user experience.
        </CookieBannerDescription>
      </CookieBanner>

      <ToastProvider>
        <ToastRoot variant="info" duration={Infinity} data-test="toast">
          <div className="space-y-1">
            <ToastTitle>Saved</ToastTitle>
            <ToastDescription>Your changes are saved.</ToastDescription>
          </div>
          <ToastClose data-test="toast-close" aria-label="Close" />
        </ToastRoot>
        <ToastViewport data-test="toast-viewport" />
      </ToastProvider>
    </>
  );
}

createRoot(document.getElementById("root")).render(<Page />);
