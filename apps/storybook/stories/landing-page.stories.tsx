import { expect, userEvent, waitFor, within } from "storybook/test";
import LandingPage from "./components/landingPage";

export default {
  title: "@govtechmy/examples/LandingPage",
  component: LandingPage,
  // remove the automatic documentation for Layout
  tags: ["!autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  // The page frame: Skiplink, then the Masthead and the Navbar, then the
  // page's one <main>, then the Footer. The first Tab focuses the skip link,
  // Enter moves focus to the <main>, and the next Tab reaches its content.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const skipLink = canvas.getByRole("link", {
      name: "Skip to main content",
    });
    const mains = canvas.getAllByRole("main");
    await expect(mains).toHaveLength(1);
    const [main] = mains;

    await expect(skipLink).toHaveAttribute("href", "#main-content");
    await expect(main).toHaveAttribute("id", "main-content");
    await expect(main).toHaveAttribute("tabindex", "-1");

    // The skip link comes before the Masthead, outside it and outside the
    // Navbar's <header> and any <nav>.
    const masthead = canvasElement.querySelector<HTMLElement>("#masthead");
    await expect(masthead).not.toBeNull();
    await expect(
      skipLink.compareDocumentPosition(masthead!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    await expect(skipLink.closest("#masthead, header, nav")).toBeNull();

    // The Masthead, the Navbar and the Footer stay outside the <main>, and
    // the content <section> sits inside it.
    await expect(main).not.toContainElement(masthead);
    await expect(main).not.toContainElement(canvas.getByRole("banner"));
    await expect(main).not.toContainElement(canvas.getByRole("contentinfo"));
    await expect(main).toContainElement(
      canvas.getByRole("heading", { name: "Title" }),
    );

    await userEvent.tab();
    await expect(skipLink).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(main).toHaveFocus());
    await userEvent.tab();
    await expect(
      canvas.getByRole("button", { name: "Click here" }),
    ).toHaveFocus();

    // Storybook runs this play function whenever the story renders, not only
    // in tests. Put the page back as it was, so that a reader's first Tab
    // still focuses the skip link: drop the fragment, and move focus and the
    // focus navigation starting point from the button back to the story's
    // root. Blurring the button alone leaves the starting point after it.
    history.replaceState(null, "", location.pathname + location.search);
    canvasElement.tabIndex = -1;
    canvasElement.focus();
    canvasElement.blur();
    canvasElement.removeAttribute("tabindex");
  },
};

export const Mobile = {
  globals: {
    viewport: { value: "mobile1" },
  },
};

export const Tablet = {
  globals: {
    viewport: { value: "tablet" },
  },
};

export const Desktop = {
  globals: {
    viewport: { value: "desktop" },
  },
};
