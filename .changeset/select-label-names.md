---
"@amerfathullah/myds-react": patch
---

A string `label` on SelectValue now names its Select for assistive technology. Before, the label was drawn in the trigger before the value, as in `label="Fruit"`, but the trigger had no accessible name, and the label was read as part of its value ("Fruit Banana").

- **A non-empty string `label` names the trigger and the open list.** Both point their `aria-labelledby` at the label, so the trigger is announced as "Fruit", with the selection, or a `multiple` select's count, as its value. The label is no longer read as part of the value. An `aria-label` or `aria-labelledby` you pass to SelectContent still names the list instead.
- **A name you give the trigger still wins, and then nothing changes.** That's an `aria-label` or `aria-labelledby` on SelectTrigger, a Label whose `htmlFor` matches SelectTrigger's `id`, or a Label wrapping the Select. The trigger keeps that name, the label stays part of its value and the list isn't named by it.
- **A Select without a `label` still needs a name from you.** So does one with an empty or element `label`, which names nothing. Give SelectTrigger an `id` and a Label pointed at it, or an `aria-label`.

The name is set once the Select has mounted, so server HTML doesn't carry it until hydration. Nothing looks different, and the types are unchanged.
