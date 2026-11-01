---
"@amerfathullah/myds-react": patch
---

The 24px `Mini…` legacy icons, such as `MiniBNMIcon` and `MiniPolicePDRMIcon`, now draw in the text colour, like the full-size legacy marks, so a `txt-*` class colours them and they change with the theme. They used to be a fixed `gray-800` (#27272A), which nearly disappears on the dark theme's backgrounds. In the light theme a Mini icon now follows the surrounding text colour instead of staying `gray-800`. To keep the old look, pass `className="text-gray-800"`.
