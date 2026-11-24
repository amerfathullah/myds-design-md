# SearchBar relies on cmdk 1.1.1's internals, so cmdk is pinned exactly

SearchBar is built on cmdk's Command, Input, List and Item. Some of its accessibility defects come from how cmdk handles selection and keys, and cmdk has no API to change any of it (#205, #398, #399).

How cmdk 1.1.1 handles selection and keys:

- **One list of options for both selecting and moving.** Keyboard navigation and the select-first that runs after each query change both use `[cmdk-item]:not([aria-disabled="true"])`, and neither checks visibility. SearchBarResultsList renders a hidden `--` option first. select-first lands on it, so no result is highlighted at rest. But Home, Meta+ArrowUp, ArrowUp from the first result and a wrap with `loop` land on it too, and the highlight disappears.
- **`aria-activedescendant` is worked out at the wrong time.** cmdk works out its id before the options re-render, so it can name a result that's no longer selected. It never updates the id when the list remounts or SearchBar's `value` changes, so the id can name an option that no longer exists.
- **A controlled query arrives late on React 18.3.** A controlled Command.Input copies the query into cmdk from a passive effect. On React 18.3, select-first can then run after a key pressed straight after typing, and undo that key.
- **cmdk skips a key only when its React event reads as cancelled.** cmdk handles keys in its root's `onKeyDown`, after calling the author's. Apart from keys sent during an IME composition, it skips a key only when the React event's `defaultPrevented` is set. `preventDefault` sets it, but that also stops the browser from moving the caret or submitting a form. cmdk cancels Home and End in every state, even with no results.

SearchBar works around all four, so it relies on cmdk 1.1.1 behaviour that cmdk doesn't document:

- it keeps the hidden `--` option;
- SearchBarInput names the highlighted result itself, on the input and on the listbox, rather than using cmdk's id;
- it hides the `--` option from cmdk's navigation for each move key;
- it hands cmdk a controlled query only when the author changed it;
- it keeps some of the keys cmdk acts on away from cmdk, without cancelling them in the browser, so the input acts as a text field:
  - the keys cmdk acts on, while no list is displayed or when pressed on the Clear and Search buttons (#398);
  - Home and End, and Meta+ArrowUp and Meta+ArrowDown, with any modifiers, in every state (#399).

  Other keys, such as Escape, Tab and typed characters, reach cmdk's root and bubble on as today.

Because of that, `@amerfathullah/myds-react` depends on cmdk `1.1.1` exactly, not `^1.1.1`.

## Considered Options

- **SearchBar controls cmdk's `value`, and the hidden option goes**: rejected. It still relies on cmdk's internals: cmdk writes its store before it calls `onValueChange`, and re-reads `value` only when the prop changes.
  - It needed sentinel values, and accepted cmdk's changes only during a key or pointer event.
  - It failed 8 of #204's commit-budget tests, and briefly marked the first result selected on every keystroke.
  - It also changed what an author's `value` and `onValueChange` on SearchBar mean.
- **A `disabled` hidden option, one that isn't a cmdk item, or filtering it out**: rejected. Navigation and select-first use the same list, so each of these takes the option out of both. The first result is then highlighted at rest.
- **Keep the `^1.1.1` range**: rejected. A cmdk minor could change any of the behaviour SearchBar relies on. Consumers would install it before this repo's SearchBar tests had run against it.
- **Patch cmdk with `pnpm patch`, or fork it**: rejected. A patch applies only in this repo, not in consumers' installs. A fork is a second library for one maintainer to keep (ADR-0002).
- **Replace cmdk with another combobox library or our own**: rejected for now.
  - SearchBar's public API is cmdk's: SearchBar forwards Command's props, and the develop pages point authors at cmdk's documentation.
  - Replacing cmdk would be a new major and a rewrite of SearchBar, too much for one maintainer to fix these defects.
  - Reconsider if a pinned cmdk blocks a React upgrade, or if a cmdk release fixes these defects itself.

## Consequences

- **ADR-0004 still holds for cmdk.** cmdk 1.1.1 is its latest release (March 2025), and it supports React 18 and 19. The pin changes how a cmdk upgrade arrives, not whether it does: as a pull request that moves the pin and passes SearchBar's unit and Chromium tests, on React 19 and, by hand, React 18.3 (#402).
- **It's the react package's only exact pin.** No dependency bot runs here, so nothing will open that pull request automatically.
- **Tests guard the reliance.** SearchBar's keyboard tests, in happy-dom and in Chromium, check the defects above. A cmdk upgrade that changes the behaviour fails them. A code comment at the hidden `--` option names the behaviour relied on, and says why cmdk is pinned.
- **A consumer whose own cmdk differs gets a second copy.** SearchBar always uses its own. Raw cmdk parts or `useCommandState` from the consumer's copy, used inside SearchBar, then don't see SearchBar's state. That composition isn't supported (#403).
- **Some things stay as cmdk has them:**
  - SearchBar's own `value`, `onValueChange` and `defaultValue` keep cmdk's meaning, including the `--` value they report while nothing is highlighted.
  - On React 18.3, a query change the author makes, such as Clear, still reaches cmdk through its passive effect. Only typing is fixed.
- **Keeping a key from cmdk without cancelling it has a cost either way.** #398 chooses the route, and #399 follows it.
  - **Stopping the key below cmdk's root:** listeners above that point, `document` and `window` included, don't see it on bubble; capture listeners still do. The author's SearchBar `onKeyDown` must then be called by SearchBar, and its `currentTarget` is where the key stopped, not the root `<div>` its type names.
  - **Setting only the React event's `defaultPrevented`,** without cancelling the native event: the key bubbles as today, but React handlers above SearchBar's root read it as cancelled, and it relies on React's event internals as well as cmdk's.

  Either way, the author's SearchBar `onKeyDown` runs once, before the browser acts, and its `preventDefault` is honoured.

  #398 took the second route, and #399 follows it. It keeps the key's bubbling, `document` and `window` listeners see it uncancelled, as the browser acts on it, and the author's `onKeyDown` keeps SearchBar's root as its `currentTarget`, since cmdk still calls it. React handlers above the root read the key as cancelled, as they did when cmdk cancelled it, though its `isDefaultPrevented()` is `false`.

- **Where each workaround lands:**
  - **#398:** the pin, naming the highlighted result, and keeping keys from cmdk while no list is displayed and on the Clear and Search buttons.
  - **#399:** keeping Home and End, and the Meta arrows, from cmdk in every state.
  - **#205:** skipping the hidden option for the remaining move keys, and handing cmdk the typed query synchronously.
