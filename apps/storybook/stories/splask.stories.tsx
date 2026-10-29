import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@amerfathullah/myds-react/accordion";
import { Button } from "@amerfathullah/myds-react/button";
import { Footer } from "@amerfathullah/myds-react/footer";
import { Link } from "@amerfathullah/myds-react/link";
import { Navbar } from "@amerfathullah/myds-react/navbar";
import {
  SearchBar,
  SearchBarInput,
  SearchBarInputContainer,
  SearchBarResults,
  SearchBarResultsList,
} from "@amerfathullah/myds-react/search-bar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@amerfathullah/myds-react/select";

/**
 * SPLaSK tagging is done by passing raw `splwpk-*` attributes to MYDS components. Each story
 * here passes an arbitrary `splwpk-*` attribute to one component part and asserts that it
 * reaches that part's rendered DOM element unchanged. Hidden from the sidebar (`!dev`) but
 * still run by `test-storybook`.
 */
const meta = {
  title: "Tests/SPLaSK Tag Pass-through",
  tags: ["!autodocs", "!dev"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** An arbitrary SPLaSK attribute; its value differs from its name so a rewritten value fails. */
const splaskTag = { "splwpk-test": "tagged" };

const expectTagged = (element: HTMLElement) =>
  expect(element).toHaveAttribute("splwpk-test", "tagged");

/** The element a component renders as its root, i.e. with no wrapper in between. */
const rootOf = (canvasElement: HTMLElement) =>
  canvasElement.firstElementChild as HTMLElement;

export const LinkTag: Story = {
  render: () => (
    <Link href="#" {...splaskTag}>
      Soalan Lazim
    </Link>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link");
    await expectTagged(link);
  },
};

export const LinkAsChildTag: Story = {
  render: () => (
    <Link asChild {...splaskTag}>
      <a href="#">Soalan Lazim</a>
    </Link>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link");
    await expectTagged(link);
  },
};

export const ButtonTag: Story = {
  render: () => <Button {...splaskTag}>Hantar</Button>,
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button");
    await expectTagged(button);
  },
};

export const SearchBarTag: Story = {
  render: () => (
    <SearchBar {...splaskTag}>
      <SearchBarInputContainer>
        <SearchBarInput aria-label="Carian" placeholder="Carian" />
      </SearchBarInputContainer>
      <SearchBarResults open={false}>
        <SearchBarResultsList />
      </SearchBarResults>
    </SearchBar>
  ),
  play: async ({ canvasElement }) => {
    const root = rootOf(canvasElement);
    await expect(root).toContainElement(
      within(canvasElement).getByRole("combobox"),
    );
    await expectTagged(root);
  },
};

export const AccordionTag: Story = {
  render: () => (
    <Accordion type="single" collapsible {...splaskTag}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Apakah MYDS?</AccordionTrigger>
        <AccordionContent>Sistem Reka Bentuk Malaysia.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const root = rootOf(canvasElement);
    await expect(root).toContainElement(
      within(canvasElement).getByRole("button"),
    );
    await expectTagged(root);
  },
};

export const SelectTriggerTag: Story = {
  render: () => (
    <Select variant="outline" size="small">
      <SelectTrigger aria-label="Pilih bahasa" {...splaskTag}>
        <SelectValue label="Bahasa" placeholder="Pilih" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ms">Bahasa Melayu</SelectItem>
        <SelectItem value="en">English</SelectItem>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("combobox");
    await expectTagged(trigger);
  },
};

export const NavbarTag: Story = {
  parameters: { layout: "fullscreen" },
  render: () => <Navbar {...splaskTag} />,
  play: async ({ canvasElement }) => {
    const root = rootOf(canvasElement);
    await expect(root.tagName).toBe("HEADER");
    await expectTagged(root);
  },
};

export const FooterTag: Story = {
  parameters: { layout: "fullscreen" },
  render: () => <Footer {...splaskTag} />,
  play: async ({ canvasElement }) => {
    const root = rootOf(canvasElement);
    await expect(root.tagName).toBe("FOOTER");
    await expectTagged(root);
  },
};
