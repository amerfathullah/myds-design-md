// The `require` and `import` builds each make their own Button, as a second
// install does, so a component given a Button as its child can't tell one by
// identity. Each copy marks its own with this key instead, and `Symbol.for`
// gives every copy the same key (#119, #235), as InputIcon's mark does. The
// mark names the Button that carries it, since styled-components and
// hoist-non-react-statics copy it onto a wrapper, which isn't a Button.
// Internal: the public `utils` entry doesn't re-export it.
const button_mark = Symbol.for("@amerfathullah/myds-react/Button");

/** Marks `button` as MYDS's Button, which `isButton` then tells in any copy */
export function markButton(button: object): void {
  Object.defineProperty(button, button_mark, { value: button });
}

/** Whether `type`, an element's type, is MYDS's Button, from any copy */
export const isButton = (type: unknown): boolean =>
  typeof type === "object" &&
  type !== null &&
  (type as Record<symbol, unknown>)[button_mark] === type;
