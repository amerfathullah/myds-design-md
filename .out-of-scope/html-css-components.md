# Hand-written HTML/CSS components

MYDS doesn't ship plain HTML/CSS copies of its components. Upstream called this docs section "transistory assistance".

## Why this is out of scope

Each HTML/CSS component is a second implementation of the same design, kept in sync with the Tailwind preset by hand. Upstream's unmerged drafts for this section (nine PRs, about 8.9k lines) show the cost. They hardcode about 270 colour values instead of using tokens, invent variables the preset doesn't define, and several already disagree with each other. Every token change in the preset would need repeating across every file, for ever, by a single maintainer.

Teams not on React are already served by two things that can't drift this way:

- **DESIGN.md** describes MYDS as built, token by token and component by component, for any stack or for an AI agent building in one.
- **The Tailwind preset** (`@amerfathullah/myds-style`) works with plain HTML, so utility classes resolve to the real tokens.

See [ADR-0003](../docs/adr/0003-one-implementation-react-on-the-preset.md).

## What would change this

A way to _generate_ the HTML/CSS from the preset, so nothing is copied by hand, and someone to maintain that pipeline.

## Prior requests

- #30: "DOCS: Port upstream \"transistory assistance\" docs"
