Documentation for For FE Templates B ( React + Vite + MYDS + Layout + i18n)
===

Part 1 : Layout Prep

1. Use the Documentation for For FE Templates ( React + Vite + MYDS)
2. Create components file in src
3. Create layout file in components file
4. create Layout.tsx in layout file
5. Create MastheadMyds.tsx in layout file
6. Paste in masthead the code from [fe-template-b/src/components/layout/MastheadMyds.tsx](fe-template-b/src/components/layout/MastheadMyds.tsx)
7. Create NavbarMyds.tsx in layout file
8. Paste in navbar the code from
   [fe-template-b/src/components/layout/NavbarMyds.tsx](fe-template-b/src/components/layout/NavbarMyds.tsx)
9. Create FooterMyds.tsx in layout file
10. Paste in footer the code from
    [fe-template-b/src/components/layout/FooterMyds.tsx](fe-template-b/src/components/layout/FooterMyds.tsx)

    These are the Masthead, Navbar and Footer examples from the MYDS docs, importing `@amerfathullah/myds-react`. The examples on https://myds.vercel.app are for MYDS 1.x and import the old package name, so don't copy from there.
11. Prepare the Layout like below example by importing the MastheadMyds.tsx, NavbarMyds.tsx, FooterMyds.tsx

Ex:

```
import FooterMyds from "./FooterMyds";
import MastheadMyds from "./MastheadMyds";
import NavbarMyds from "./NavbarMyds";

type LayoutMainProps = {
  children: React.ReactNode;
};
export default function LayoutMain({ children }: LayoutMainProps) {
  return (
    <>
      <MastheadMyds></MastheadMyds>
      <NavbarMyds></NavbarMyds>
      {children}
      <FooterMyds></FooterMyds>
    </>
  );
}
```

12. Wrap the layout on app.tsx
Ex: 
```
import Layout from "./components/layout/Layout";

function App() {
  return (
    <Layout>
      <div className="bg-bg-warning-50">test</div>
    </Layout>
  );
}

export default App;
```

Part 2: i18n

1. Run `npm i i18next react-i18next`
2. Create a file i18n.ts in src file
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

4. Edit app.tsx

```
import { Button } from "@amerfathullah/myds-react/button";
import i18n from "./i18n";
import { useTranslation } from "react-i18next";

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
    <div className="bg-bg-warning-50">
      <Button onClick={toggleLangMs}>Toggle this to ms</Button>
      <Button onClick={toggleLangEn}>Toggle this to en</Button>
      <h1>{t("welcome")} sini</h1>
    </div>
  );
}

export default App;
```

the app.tsx integrates
a) Button to toggle the i18n
b) The button function

-- set the Language as EN or MS.
-- save the language in local storage
-- trigger the change using i18n

c) use the translation using {t("welcome")} where welcome is written in i18n.ts

5. Refactor out the translation where welcome is written in i18n.ts, into its own file.
   a) inside src file, create locales file.
   b) inside the locales file created, create 2 file, ms and en
   c) inside ms file, create ms-MY.json and paste

```
{
  "welcome": "Selamat Datang",
  "about": "Tentang Kami"
}
```

d) inside en file, create en-GB.json and paste

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

6. Wrap the app with suspense in case of load in main.tsx

```
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <App />
    </Suspense>
  </StrictMode>
);
```
