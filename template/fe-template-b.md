Documentation for For FE Templates B ( React + Vite + MYDS + Layout + i18n)
===

Part 1 : Layout Prep

1. Start from the app you built with [fe-template-a.md](fe-template-a.md) (React + Vite + MYDS)
2. Create a components folder in src
3. Create a layout folder in the components folder
4. Create LayoutMain.tsx in the layout folder
5. Create MastheadMyds.tsx in the layout folder
6. Paste in masthead the code from [fe-template-b/src/components/layout/MastheadMyds.tsx](fe-template-b/src/components/layout/MastheadMyds.tsx)
7. Create NavbarMyds.tsx in the layout folder
8. Paste in navbar the code from
   [fe-template-b/src/components/layout/NavbarMyds.tsx](fe-template-b/src/components/layout/NavbarMyds.tsx)

   Its logo loads `/logo.svg`, so copy [fe-template-b/public/logo.svg](fe-template-b/public/logo.svg) into your app's `public` folder.
9. Create FooterMyds.tsx in the layout folder
10. Paste in footer the code from
    [fe-template-b/src/components/layout/FooterMyds.tsx](fe-template-b/src/components/layout/FooterMyds.tsx)

    These files hold this repo's docs examples of the page-level components Masthead, Navbar and Footer, importing `@amerfathullah/myds-react`. Upstream's docs at https://myds.vercel.app are for MYDS 1.x and import the old package name, so don't copy from there.
11. Paste this into LayoutMain.tsx. It imports MastheadMyds, NavbarMyds and FooterMyds from the layout folder, and `Skiplink` from `@amerfathullah/myds-react/skiplink`.

    The skip link comes first, before the Masthead, and points at the `<main id="main-content">` that holds the page's content. Its `tabIndex={-1}` makes following the link move focus to the content.

```
import { Skiplink } from "@amerfathullah/myds-react/skiplink";
import FooterMyds from "./FooterMyds";
import MastheadMyds from "./MastheadMyds";
import NavbarMyds from "./NavbarMyds";

type LayoutMainProps = {
  children: React.ReactNode;
};
export default function LayoutMain({ children }: LayoutMainProps) {
  return (
    <>
      <Skiplink href="#main-content">Skip to main content</Skiplink>
      <MastheadMyds></MastheadMyds>
      <NavbarMyds></NavbarMyds>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <FooterMyds></FooterMyds>
    </>
  );
}
```

12. Wrap the content of App.tsx in `LayoutMain`

```
import LayoutMain from "./components/layout/LayoutMain";

function App() {
  return (
    <LayoutMain>
      <div className="bg-bg-warning-50">test</div>
    </LayoutMain>
  );
}

export default App;
```

13. Wrap the app in a `ThemeProvider` from `@amerfathullah/myds-react/hooks` in main.tsx

    NavbarMyds's `ThemeSwitch` changes the theme only under a `ThemeProvider`, and one provider at the root of the app serves every switch.

```
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@amerfathullah/myds-react/hooks";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
```

Part 2: i18n

1. Run `npm i i18next react-i18next`
2. Create a file i18n.ts in the src folder
3. Paste into i18n.ts

```
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      welcome: "Welcome",
      about: "About us",
    },
  },
  ms: {
    translation: {
      welcome: "Selamat Datang",
      about: "Tentang Kami",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
```

4. Replace the code in App.tsx with this, which keeps `LayoutMain` around the content

```
import { Button } from "@amerfathullah/myds-react/button";
import i18n from "./i18n";
import { useTranslation } from "react-i18next";
import LayoutMain from "./components/layout/LayoutMain";

function App() {
  // When first initialize get the language from local storage.
  let initData = localStorage.getItem("lang");

  // If not available then set en as reference
  if (initData !== "en" && initData !== "ms") {
    initData = "en";
    localStorage.setItem("lang", initData);
  }

  // if the language is available, apply language immediately
  if (i18n.language !== initData) {
    i18n.changeLanguage(initData);
  }

  const toggleLangEn = () => {
    localStorage.setItem("lang", "en");
    i18n.changeLanguage("en");
  };

  const toggleLangMs = () => {
    localStorage.setItem("lang", "ms");
    i18n.changeLanguage("ms");
  };

  const { t } = useTranslation();

  return (
    <LayoutMain>
      <div className="bg-bg-warning-50">
        <Button onClick={toggleLangMs}>Toggle this to ms</Button>
        <Button onClick={toggleLangEn}>Toggle this to en</Button>
        <h1>{t("welcome")} sini</h1>
      </div>
    </LayoutMain>
  );
}

export default App;
```

App.tsx integrates
a) Button to toggle the i18n
b) The button function

-- set the Language as EN or MS.
-- save the language in local storage
-- trigger the change using i18n

c) use the translation using {t("welcome")} where welcome is written in i18n.ts

d) `LayoutMain` stays around the content, so the page keeps the skip link, Masthead, Navbar and Footer from Part 1

5. Refactor out the translation where welcome is written in i18n.ts, into its own file.
   a) inside the src folder, create a locales folder.
   b) inside the locales folder created, create 2 folders, ms and en
   c) inside the ms folder, create ms-MY.json and paste

```
{
  "welcome": "Selamat Datang",
  "about": "Tentang Kami"
}
```

d) inside the en folder, create en-GB.json and paste

```
{
  "welcome": "Welcome",
  "about": "About us"
}
```

e) Refactor the i18n by removing the translation into their own file. import the file into the translation.

```
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en/en-GB.json";
import ms from "./locales/ms/ms-MY.json";

const resources = {
  en: { translation: en },
  ms: {
    translation: ms,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
```

6. Wrap the app with suspense in case of load in main.tsx, inside the `ThemeProvider`

```
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@amerfathullah/myds-react/hooks";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <App />
      </Suspense>
    </ThemeProvider>
  </StrictMode>
);
```
