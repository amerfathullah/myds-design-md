import React, {
  FunctionComponent,
  ComponentProps,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
  forwardRef,
} from "react";
import { Command } from "cmdk";
import { Button, ButtonProps } from "./button";
import { CrossIcon, SearchIcon } from "../icons";
import { clx } from "../utils";
import { cva } from "class-variance-authority";
import { sharedContext } from "../utils/registry";

type SearchBarSize = "small" | "medium" | "large";
const DEFAULT_SIZE: SearchBarSize = "medium";

/**
 * A results part mounted in a SearchBar: a SearchBarResults panel and the id
 * given to it, or a SearchBarResultsList and whether it's displayed
 */
type Part =
  | { kind: "panel"; id: string | undefined }
  | { kind: "list"; displayed: boolean };

/** How SearchBarInput wires its <input>, from the parts mounted */
type Wiring = {
  /** Its `aria-expanded`: whether a listbox is displayed */
  expanded: boolean;
  /**
   * What its `aria-controls` names: cmdk's listbox, while one is mounted;
   * else the panel, by `givenId` or the generated id; else nothing
   */
  controls: "listbox" | "panel" | "nothing";
  /** The id given to the panel the input names, if any */
  givenId?: string;
};

// The input's wiring with no parts mounted, and until it reads them
const COLLAPSED: Wiring = { expanded: false, controls: "nothing" };

/**
 * The results parts mounted in one SearchBar. They add themselves from layout
 * effects, and SearchBarInput subscribes, so a part mounting, unmounting or
 * changing rewires the input alone, before paint. SearchBar's context value
 * never changes with them: on React 18 a change there during hydration would
 * client-render any `<Suspense>` boundary inside the bar (#204).
 */
function createParts() {
  const parts = new Set<Part>();
  const listeners = new Set<() => void>();
  let wiring = COLLAPSED;
  const rewire = () => {
    let lists = false;
    let displayed = false;
    let panels = false;
    let givenId: string | undefined;
    for (const part of parts) {
      if (part.kind === "list") {
        lists = true;
        displayed = displayed || part.displayed;
      } else {
        panels = true;
        // The last panel given an id wins, as the last id given did before
        if (part.id) givenId = part.id;
      }
    }
    const next: Wiring = lists
      ? { expanded: displayed, controls: "listbox" }
      : panels
        ? { expanded: false, controls: "panel", givenId }
        : COLLAPSED;
    if (
      next.expanded === wiring.expanded &&
      next.controls === wiring.controls &&
      next.givenId === wiring.givenId
    )
      return;
    wiring = next;
    listeners.forEach((listener) => listener());
  };
  return {
    /** Counts `part` as mounted until the function it returns is called */
    add: (part: Part) => {
      parts.add(part);
      rewire();
      return () => {
        parts.delete(part);
        rewire();
      };
    },
    /** Calls `listener` after each change of wiring, until unsubscribed */
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    wiring: () => wiring,
  };
}

type Parts = ReturnType<typeof createParts>;

// Every copy of the library's major shares this context and its default, so
// a field added to it is optional, and read with a fallback (`registry.ts`)
type Context = {
  size: SearchBarSize;
  /** The id SearchBarResults renders when it's given none */
  generatedResultsId?: string;
  /**
   * What an older copy's SearchBarInput points `aria-controls` at. An older
   * copy's SearchBar sets it to the id given to SearchBarResults, else the
   * generated one; this one sets the generated one.
   */
  resultsId?: string;
  /**
   * Registers the id given to SearchBarResults in an older copy's SearchBar.
   * This one's does nothing: parts register in `parts`.
   */
  setGivenResultsId: Dispatch<SetStateAction<string | undefined>>;
  /** The results parts mounted in this SearchBar. An older copy has none. */
  parts?: Parts;
};

const SearchBarContext = sharedContext<Context>("SearchBarContext", {
  size: DEFAULT_SIZE,
  setGivenResultsId: () => {},
});

/**
 * Whether the nearest SearchBarResults is open. A SearchBarResultsList
 * outside one counts as displayed.
 */
const SearchBarResultsContext = sharedContext<{ open: boolean }>(
  "SearchBarResultsContext",
  { open: true },
);

const ignoreGivenResultsId = () => {};

// Layout effects don't run on the server, and React 18 warns there, so the
// server gets useEffect
const useBeforePaint =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

// SearchBarInput's wiring from `parts`. It's collapsed until a layout effect
// reads the parts, as in server HTML, so hydration matches; then it follows
// each change before paint.
function useWiring(parts: Parts | undefined) {
  const [wiring, setWiring] = useState(COLLAPSED);
  useBeforePaint(() => {
    if (!parts) return;
    const read = () => setWiring(parts.wiring());
    read();
    return parts.subscribe(read);
  }, [parts]);
  return wiring;
}

interface SearchBarProps extends ComponentProps<typeof Command> {
  size?: SearchBarSize;
}

/**
 * Uses cmdk's Command API.
 * @see https://github.com/pacocoursey/cmdk#command-cmdk-root
 */
const SearchBar: FunctionComponent<SearchBarProps> = forwardRef(
  ({ children, className, size = DEFAULT_SIZE, ...props }, ref) => {
    // One id per SearchBar, so two on a page don't share their results' id
    const generatedResultsId = useId();
    const [parts] = useState(createParts);
    const context = useMemo(
      () => ({
        size,
        generatedResultsId,
        resultsId: generatedResultsId,
        setGivenResultsId: ignoreGivenResultsId,
        parts,
      }),
      [size, generatedResultsId, parts],
    );
    return (
      <SearchBarContext.Provider value={context}>
        <Command
          ref={ref}
          className={clx("relative z-0", className)}
          shouldFilter={false}
          {...props}
        >
          {children}
        </Command>
      </SearchBarContext.Provider>
    );
  },
);

const search_bar_input_container_cva = cva(
  [
    "flex items-center bg-bg-white border border-otl-gray-200 hover:border-otl-gray-300 shadow-button",
    "has-[input:focus]:ring-3 has-[input:focus]:ring-fr-primary has-[input:focus]:border-otl-primary-300",
  ],
  {
    variants: {
      size: {
        small: "pl-[10px] pr-2 py-[6px] gap-2 rounded-sm text-sm",
        medium: "px-[12px] pr-2.5 py-[7px] gap-2 rounded-md text-md",
        large: "pl-[18px] pr-1.5 py-[6px] gap-2.5 rounded-full text-md",
      },
    },
    defaultVariants: {
      size: DEFAULT_SIZE,
    },
  },
);
export const SearchBarInputContainer: FunctionComponent<
  ComponentProps<"div">
> = ({ className, ...props }) => {
  const { size } = useContext(SearchBarContext);
  return (
    <div
      className={search_bar_input_container_cva({ size, className })}
      {...props}
    />
  );
};

// A naming prop counts only when it holds text: `undefined`, as a
// prop-forwarding wrapper passes, and an empty or blank string name nothing
const hasText = (value: string | undefined): value is string =>
  typeof value === "string" && value.trim() !== "";

/**
 * Uses cmdk's Command.Input API. Its own `aria-labelledby` names the input,
 * then its own `aria-label`, then SearchBar's `label`; it has no default.
 * cmdk owns the input's `id`, so an `id` doesn't reach it: for a visible
 * label, point `aria-labelledby` at a Label's `id`.
 *
 * It's expanded while a SearchBarResultsList is displayed, and its
 * `aria-controls` names that listbox while one is mounted, else the
 * SearchBarResults panel, else nothing. An `aria-expanded` or
 * `aria-controls` you pass wins.
 * @see https://github.com/pacocoursey/cmdk#input-cmdk-input
 */
export const SearchBarInput: FunctionComponent<
  Omit<ComponentProps<typeof Command.Input>, "asChild">
> = forwardRef(
  (
    {
      className,
      "aria-controls": ariaControls,
      "aria-expanded": ariaExpanded,
      "aria-labelledby": ariaLabelledBy,
      ...props
    },
    ref,
  ) => {
    const { resultsId, generatedResultsId, parts } =
      useContext(SearchBarContext);
    const wiring = useWiring(parts);
    // In an older copy's SearchBar, which has no parts, the input keeps that
    // copy's wiring: its results id, and cmdk's `aria-expanded`
    const controls =
      ariaControls != null
        ? { "aria-controls": ariaControls }
        : !parts
          ? { "aria-controls": resultsId }
          : wiring.controls === "listbox"
            ? {}
            : {
                "aria-controls":
                  wiring.controls === "panel"
                    ? (wiring.givenId ?? generatedResultsId)
                    : undefined,
              };
    const expanded =
      ariaExpanded != null
        ? { "aria-expanded": ariaExpanded }
        : parts
          ? { "aria-expanded": wiring.expanded }
          : {};
    // cmdk's `aria-labelledby` points at its hidden label, which holds
    // SearchBar's `label`. It stays unless the author names the input: their
    // `aria-labelledby` replaces it, and their `aria-label` drops it, as
    // dom-accessibility-api, and so Testing Library, doesn't fall through
    // from an empty label to an `aria-label`. The key is left off the child
    // otherwise, since even an `undefined` there would erase cmdk's.
    const labelledBy = hasText(ariaLabelledBy)
      ? { "aria-labelledby": ariaLabelledBy }
      : hasText(props["aria-label"])
        ? { "aria-labelledby": undefined }
        : {};
    return (
      <Command.Input
        ref={ref}
        className={clx(
          "text-txt-black-900 placeholder:text-txt-black-500 flex-1 bg-transparent focus:outline-hidden",
          className,
        )}
        {...props}
        // After the props, so an untyped `asChild={false}` can't make cmdk
        // render a second <input> around this one (#206)
        asChild
      >
        {/* cmdk always says the input is expanded, and points `aria-controls`
        at its listbox, SearchBarResultsList, mounted or not. So the input is
        expanded only while a listbox is displayed, and names the listbox
        while one is mounted by leaving cmdk's `aria-controls` in place. With
        no list it names the SearchBarResults panel, and with no panel either
        an `undefined` erases cmdk's, so it never names a missing id. Server
        HTML is collapsed and names nothing, as the parts register only once
        the page hydrates. The wiring and the name sit on this child because
        a key it sets wins over cmdk's, even an `undefined` one, and cmdk
        sets its own after spreading ours. */}
        <input {...controls} {...expanded} {...labelledBy} />
      </Command.Input>
    );
  },
);

/**
 * The icon-only search button. Screen readers announce it as "Search"; pass
 * an `aria-label` to name it in your site's language.
 */
export const SearchBarSearchButton: FunctionComponent<ButtonProps> = ({
  className,
  ...props
}) => {
  const { size } = useContext(SearchBarContext);
  if (size === "large") {
    return (
      <Button
        className={clx(
          "border-primary-600 from-primary-400 to-primary-600 rounded-full border bg-linear-to-b/srgb p-1",
          className,
        )}
        aria-label="Search"
        {...props}
      >
        <SearchIcon className="text-white" />
      </Button>
    );
  }
  return (
    <Button
      variant="default-ghost"
      className={clx("p-0", className)}
      aria-label="Search"
      {...props}
    >
      <SearchIcon className="text-txt-black-500" />
    </Button>
  );
};

/**
 * The icon-only clear button. Screen readers announce it as "Clear"; pass an
 * `aria-label` to name it in your site's language.
 */
export const SearchBarClearButton: FunctionComponent<ButtonProps> = ({
  className,
  ...props
}) => {
  return (
    <Button
      variant="default-ghost"
      className={clx("p-0", className)}
      aria-label="Clear"
      {...props}
    >
      <CrossIcon className="text-txt-black-500" />
    </Button>
  );
};

export const SearchBarHint: FunctionComponent<ComponentProps<"div">> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={clx(
        "text-txt-black-500 flex items-center gap-1 text-sm",
        className,
      )}
      {...props}
    />
  );
};

const search_bar_results_dropdown_cva = cva(
  [
    "-z-10 bg-bg-white absolute w-full border border-t-0 border-otl-gray-200 shadow px-[6px] py-[8px] shadow-context-menu",
    "before:bg-bg-white before:-left-px before:-right-px before:-top-4 before:border-x before:border-otl-gray-200  before:h-4 before:absolute",
  ],
  {
    variants: {
      size: {
        small: "rounded-b-sm",
        medium: "rounded-b-md",
        large: "rounded-b-2xl",
      },
    },
    defaultVariants: {
      size: DEFAULT_SIZE,
    },
  },
);
/**
 * The results panel. SearchBarInput's `aria-controls` names it while no
 * SearchBarResultsList is mounted, and the listbox while one is. Its id is
 * generated, one per SearchBar, unless you pass one. A list inside it is
 * displayed only while it's `open`.
 */
export const SearchBarResults: FunctionComponent<
  ComponentProps<"div"> & {
    open: boolean;
  }
> = ({ className, open, id, ...props }) => {
  const { size, generatedResultsId, setGivenResultsId, parts } =
    useContext(SearchBarContext);
  // Count this panel, and the id given to it, from before the browser paints
  // until it unmounts. An older copy's SearchBar has no parts: point its
  // input at a given id, and stop when it's taken away, unless another has
  // replaced it by then.
  useBeforePaint(() => {
    if (parts) return parts.add({ kind: "panel", id: id || undefined });
    if (!id) return;
    setGivenResultsId(id);
    return () =>
      setGivenResultsId((current) => (current === id ? undefined : current));
  }, [parts, id, setGivenResultsId]);
  const results = useMemo(() => ({ open: Boolean(open) }), [open]);
  return (
    <SearchBarResultsContext.Provider value={results}>
      <div
        className={clx(
          search_bar_results_dropdown_cva({ size, className }),
          !open && "hidden",
        )}
        {...props}
        id={id || generatedResultsId}
      />
    </SearchBarResultsContext.Provider>
  );
};

/**
 * Uses cmdk's Command.List API. Screen readers announce the list as
 * "Suggestions"; pass an `aria-label` to name it in your site's language.
 * While it's mounted, SearchBarInput's `aria-controls` names it, and the
 * input is expanded unless the SearchBarResults around it is closed.
 * @see https://github.com/pacocoursey/cmdk#list-cmdk-list
 */
export const SearchBarResultsList: FunctionComponent<
  ComponentProps<typeof Command.List>
> = ({ children, "aria-label": ariaLabel, label, ...props }) => {
  const { parts } = useContext(SearchBarContext);
  const { open } = useContext(SearchBarResultsContext);
  // Count this list, and whether it's displayed, from before the browser
  // paints until it unmounts
  useBeforePaint(
    () => parts?.add({ kind: "list", displayed: open }),
    [parts, open],
  );
  return (
    // cmdk names the listbox from `label`, after the props it spreads, so an
    // `aria-label` reaches the listbox only through `label`
    <Command.List label={ariaLabel ?? label ?? "Suggestions"} {...props}>
      {/* We include a hidden item to prevent cmdk from focusing on the first item automatically. */}
      <Command.Item className="hidden">--</Command.Item>
      {children}
    </Command.List>
  );
};

/**
 * Uses cmdk's Command.Group API.
 * @see https://github.com/pacocoursey/cmdk#group-cmdk-group-hidden
 */
export const SearchBarResultsGroup: FunctionComponent<
  ComponentProps<typeof Command.Group>
> = ({ className, ...props }) => {
  return (
    <Command.Group
      className={clx(
        "my-2 text-sm first:mt-0 last:mt-0",
        "[&_[cmdk-group-heading]]:text-txt-black-500 [&_[cmdk-group-heading]]:mb-1 [&_[cmdk-group-heading]]:ml-3 [&_[cmdk-group-heading]]:font-medium",
        className,
      )}
      {...props}
    />
  );
};

/**
 * Uses cmdk's Command.Item API.
 * @see https://github.com/pacocoursey/cmdk#item-cmdk-item-data-disabled-data-selected
 */
export const SearchBarResultsItem: FunctionComponent<
  ComponentProps<typeof Command.Item>
> = ({ className, ...props }) => {
  return (
    <Command.Item
      className={clx(
        "data-[selected=true]:bg-bg-washed text-txt-black-900 flex cursor-pointer items-center gap-2 rounded px-3 py-2",
        className,
      )}
      {...props}
    />
  );
};

export { SearchBar };
