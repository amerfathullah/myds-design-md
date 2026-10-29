Documentation for For FE Templates A ( React + Vite + MYDS )
===

1. Prepare a file naming in all small letter, else will trigger package name error.
2. Run `npm create vite@latest`
3. Set Project Name
4. Select React
5. Select Typescript
6. Cd into the project and run `npm i`
7. Remove App.css
8. Remove everything inside index.css
9. Remove filler inside App.tsx, write only then save ` <div>test</div>`
10. npm run dev
11. remove Readme.md infos.
12. Open the Tailwind docs for Vite https://tailwindcss.com/docs/installation/using-vite
13. Run `npm install tailwindcss @tailwindcss/vite`
14. Add the Tailwind plugin to vite.config.ts

```
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

15. Run
```
npm install @amerfathullah/myds-react @amerfathullah/myds-style
```
16. Add this code into index.css. MYDS doesn't load fonts, so load Inter and Poppins yourself, for example from Google Fonts.
```
@import "tailwindcss";
@import "@amerfathullah/myds-style";

@source "../node_modules/@amerfathullah/myds-react/dist";
```
17. Run 
```
npm run dev
```
18.  Edit 
```
<div>test</div>
```
 into 
 ```
 <div className='bg-bg-warning-50'>test</div>
 ```
 
19. Restart tailwind intelisense