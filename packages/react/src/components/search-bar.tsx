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

type Context = {
  size: SearchBarSize;
  /** The id SearchBarResults renders when it's given none */
  generatedResultsId?: string;
  /**
   * The id SearchBarInput's <input> points `aria-controls` at: the id given
   * to SearchBarResults, else the generated one
   */
  resultsId?: string;
  /** Registers the id given to SearchBarResults, or clears it */
  setGivenResultsId: Dispatch<SetStateAction<string | undefined>>;
};

const SearchBarContext = sharedContext<Context>("SearchBarContext", {
  size: DEFAULT_SIZE,
  setGivenResultsId: () => {},
});

// Layout effects don't run on the server, and React 18 warns there, so the
// server gets useEffect
const useBeforePaint =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

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
    const [givenResultsId, setGivenResultsId] = useState<string>();
    const context = useMemo(
      () => ({
        size,
        generatedResultsId,
        resultsId: givenResultsId ?? generatedResultsId,
        setGivenResultsId,
      }),
      [size, generatedResultsId, givenResultsId],
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

/**
 * Uses cmdk's Command.Input API.
 * @see https://github.com/pacocoursey/cmdk#input-cmdk-input
 */
export const SearchBarInput: FunctionComponent<
  ComponentProps<typeof Command.Input>
> = forwardRef(
  ({ className, "aria-controls": ariaControls, ...props }, ref) => {
    const { resultsId } = useContext(SearchBarContext);
    return (
      <Command.Input
        ref={ref}
        className={clx(
          "text-txt-black-900 placeholder:text-txt-black-500 flex-1 bg-transparent focus:outline-hidden",
          className,
        )}
        asChild
        {...props}
      >
        {/* cmdk points `aria-controls` at its listbox, SearchBarResultsList,
        while always reporting `aria-expanded="true"`. The listbox may be
        unmounted, as when there are no results, which would leave the input
        controlling an element that doesn't exist. So the input points at the
        SearchBarResults panel, which stays mounted. The value sits on this
        child because its props win over the ones cmdk passes, and cmdk sets
        its own after spreading ours. */}
        <input aria-controls={ariaControls ?? resultsId} />
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
 * The results panel, which SearchBarInput's `aria-controls` points at. Its id
 * is generated, one per SearchBar, unless you pass one.
 */
export const SearchBarResults: FunctionComponent<
  ComponentProps<"div"> & {
    open: boolean;
  }
> = ({ className, open, id, ...props }) => {
  const { size, generatedResultsId, setGivenResultsId } =
    useContext(SearchBarContext);
  // Point the input at a given id before the browser paints, and stop when
  // it's taken away, unless another has replaced it by then
  useBeforePaint(() => {
    if (!id) return;
    setGivenResultsId(id);
    return () =>
      setGivenResultsId((current) => (current === id ? undefined : current));
  }, [id, setGivenResultsId]);
  return (
    <div
      className={clx(
        search_bar_results_dropdown_cva({ size, className }),
        !open && "hidden",
      )}
      {...props}
      id={id || generatedResultsId}
    />
  );
};

/**
 * Uses cmdk's Command.List API. Screen readers announce the list as
 * "Suggestions"; pass an `aria-label` to name it in your site's language.
 * @see https://github.com/pacocoursey/cmdk#list-cmdk-list
 */
export const SearchBarResultsList: FunctionComponent<
  ComponentProps<typeof Command.List>
> = ({ children, "aria-label": ariaLabel, label, ...props }) => {
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
