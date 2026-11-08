---
"@amerfathullah/myds-react": patch
---

`IdentityJPNIcon` and `MiniIdentityJPNIcon` now name their inner group `agency-icons/mini/identity-jpn`, as the other legacy icons name theirs, such as `agency-icons/mini/dosm`. It was `agency-icons/miniidentity-jpn`, without the slash. Both icons draw the same as before. Nothing in the library refers to this id, and it's the only such id that changes in this release, so anything that selects the old one, such as a test or a stylesheet, needs the new one.
