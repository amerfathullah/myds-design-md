Documentation for For FE Templates A ( React + Vite + MYDS )
===

1. Prepare a file naming in all small letter, else will trigger package name error.
2. Run `npm create vite@latest`
3. Set Project Name
4. Select React
5. Select TypeScript
6. Select Oxlint as the linter, and answer No to "Install with npm and start now?"
7. Cd into the project and run `npm i`
8. Remove App.css
9. Remove everything inside index.css
10. Remove filler inside App.tsx, write only then save ` <div>test</div>`
11. npm run dev
12. remove Readme.md infos.
13. Open the Tailwind docs for Vite https://tailwindcss.com/docs/installation/using-vite
14. Run `npm install tailwindcss @tailwindcss/vite`
15. Add the Tailwind plugin to vite.config.ts

```
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

16. Run
```
npm install @amerfathullah/myds-react @amerfathullah/myds-style
```
17. Add this code into index.css. MYDS doesn't load fonts, so the first line loads Inter and Poppins from Google Fonts.
```
@import url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Poppins:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&display=swap");

@import "tailwindcss";
@import "@amerfathullah/myds-style";

@source "../node_modules/@amerfathullah/myds-react/dist";
```
18. In index.html, add the MYDS body font to the body tag, so text outside MYDS components uses Inter
```
<body class="font-body">
```
19. Run 
```
npm run dev
```
20.  Edit 
```
<div>test</div>
```
 into 
 ```
 <div className='bg-bg-warning-50'>test</div>
 ```
 
21. Restart tailwind intelisense
