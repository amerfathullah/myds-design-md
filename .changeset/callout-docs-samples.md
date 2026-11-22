---
"@govtechmy/myds-docs": patch
"@govtechmy/myds-storybook": patch
---

The Callout develop pages (EN/MS) show code you can copy as it is, and the Malay page says what the English one does. The Usage import brings in all five parts, `CalloutClose` among them, and `Button`, which every example uses. The opening Code tab imports `Button` too, and its preview's button says "Call to Action", as its code does. Before, the Anatomy and Dismissible samples used `CalloutClose`, and every sample used `Button`, without importing them. Layout says a callout with `CalloutContent` is stacked whether or not it has an action, and its stacked preview is the success callout its Code tab shows. The Malay page now has that Layout section (Susun Atur), `CalloutClose` in its Anatomi block, and Variant comments that match the English ones, and its intro calls the component a callout. Neither page mentions a render prop on `CalloutAction`, which has none: the action sample dismisses the callout through `CalloutClose`. The Dismissible previews do what their samples do. In the basic one, only the cross dismisses, with no alert. In the action one, the action button, wrapped in `CalloutClose`, dismisses it too, and `onDismiss` alerts first. On the Malay page, the previews' buttons, the close button's name ("Tutup"), the alert and the console message are in Malay, and the same as in its samples.

The Callout story's Usage block in Storybook imports what it uses.
