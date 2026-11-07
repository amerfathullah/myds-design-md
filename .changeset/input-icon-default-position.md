---
"@amerfathullah/myds-react": patch
---

InputIcon's `position` is now optional and defaults to `left`, the side an InputIcon without it already drew on. `<InputIcon>` and `position={undefined}` now type-check. TypeScript still rejects any side but `left` and `right`.

Input now pads the field for an InputIcon without `position`. The `<input>` gets `data-has-left-icon="true"` and its 40px left padding, as with `position="left"`, so the placeholder and typed text no longer run under the icon. It does whichever build, `require` or `import`, Input and the InputIcon each come from. Explicit `left` and `right`, and a left and a right icon together, render as before. Input still reads only its direct children: an InputIcon inside a Fragment or inside your own component gets no padding, unless your component is the child Input reads and is given `position`.
