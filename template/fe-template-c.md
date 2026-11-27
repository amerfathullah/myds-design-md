
Documentation for For FE Templates C ( React + Vite + MYDS + Layout + i18n + router)
===

Follow [fe-template-b.md](fe-template-b.md), both parts, first. This walkthrough builds on what it adds:

- `LayoutMain.tsx` and the MastheadMyds.tsx, NavbarMyds.tsx and FooterMyds.tsx files in `src/components/layout`
- `i18n.ts` and the locale files in `src/locales`
- the logo in `public`
- the `i18next` and `react-i18next` packages

1. Run
``` npm i react-router ```
React Router 8 needs Node.js 22.22 or newer.
2. Create a pages folder in src
3. Create About.tsx , Home.tsx and Error.tsx and put them in the pages folder
4. Edit About.tsx
```
export default function AboutPage() {
  return <div>This is About Page</div>;
}
```
5. Edit Home.tsx
```
export default function HomePage() {
  return <div>This is Home Page</div>;
}
```
6. Edit Error.tsx
```
export default function ErrorPage() {
  return <div>This is Error Page</div>;
}
```

7. Refactor `src/components/layout/LayoutMain.tsx` to clear up App.tsx and improve the layout
a) Toggle Language now 
	-- check the path and replaces the lang on path
	-- navigate to new path and re-render using react-router
b) Since using React Router, change children to <Outlet>
c) Render `Skiplink` first, before the Masthead, and wrap the demo block and the `<Outlet>` in `<main id="main-content" tabIndex={-1}>`, which the skip link points at. Its `tabIndex={-1}` makes following the link move focus to the content.

```
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import FooterMyds from "./FooterMyds";
import MastheadMyds from "./MastheadMyds";
import NavbarMyds from "./NavbarMyds";
import { Outlet, useNavigate } from "react-router";
import { Button } from "@amerfathullah/myds-react/button";
import { Skiplink } from "@amerfathullah/myds-react/skiplink";

export default function LayoutMain() {
  const navigate = useNavigate();

  const toggleLangEn = () => {
    localStorage.setItem("lang", "en");
    i18n.changeLanguage("en");
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(/^\/(en|ms)/, `/en`);
    navigate(newPath);
  };

  const toggleLangMs = () => {
    localStorage.setItem("lang", "ms");
    i18n.changeLanguage("ms");
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(/^\/(en|ms)/, `/ms`);
    navigate(newPath);
  };

  const { t } = useTranslation();

  return (
    <>
      <Skiplink href="#main-content">Skip to main content</Skiplink>
      <MastheadMyds></MastheadMyds>
      <NavbarMyds></NavbarMyds>
      <main id="main-content" tabIndex={-1}>
        <div className="bg-bg-warning-50">
          <Button onClick={toggleLangMs}>Toggle this to ms</Button>
          <Button onClick={toggleLangEn}>Toggle this to en</Button>
          <h1>{t("welcome")} sini</h1>
        </div>

        {/* use outlet instead of children to tell where to render child routes for the current route hierarchy. */}
        <Outlet></Outlet>
      </main>
      <FooterMyds></FooterMyds>
    </>
  );
}
```
8. Rework App.tsx to prepare it for clear separation and integration of  Routing.
a) Clear separation: `main.tsx` handles app initialization, `App.tsx` handles app layout and routing.
b) Add Browser Router to wrap the app routes
c) Add App Routes which is the router.tsx later on.
```
import AppRoutes from "./router";
import { BrowserRouter } from "react-router";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes></AppRoutes>
    </BrowserRouter>
  );
}
export default App;
```
9. Edit main.tsx so the whole app sits inside one `ThemeProvider` from `@amerfathullah/myds-react/hooks`, around the `Suspense`
-- NavbarMyds's `ThemeSwitch` changes the theme only under a `ThemeProvider`, and one provider at the root of the app serves every switch.
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
10. Create router.tsx inside src
a) The router sends `/` to the language stored in local storage. LangWrapper (step 11) sends a language other than `en` or `ms` to the stored language, or to `/en` when none is stored, as with `/null` on a first visit.
b) Routes from `/` to `/lang` --> making sure if someone goes to `/`, it goes to `lang`
c) The path of `:lang` which is the dynamic route, contain an element `LangWrapper` where is set to get the language and share it with the pages and also handle error page `/*`
--You can remove it IF you plan to go with fetch language on every page, but you need to write back error handling for `/*` route.
d) Added LayoutMain to cover all the pages.
-- IF there is another pages that did not follow the general layout, take it out from `<Route element={<LayoutMain />}>` and create  a new wrapper Route `<Route element={<NewLayout />}>` and wrap he pages inside.
e) Main page is `<Route index element={<HomePage />} />`, feel free to edit `HomePage`
f)  To add pages, add new route and new path `<Route path="newpage" element={<NewPage />} />`
g) Error page handling on path `/lang/*` is handled by `Redirect404Page()`
h) Error page handling on path `/*` is handled by `LangWrapper.tsx` where it redirects the page back to `/lang` where it reads the local storage.
i) Error page itself is in `<Route path="404" element={<ErrorPage />} />`

```
import { Routes, Route, Navigate, useParams } from "react-router";
import LangWrapper from "./LangWrapper";
import HomePage from "./pages/Home";
import AboutPage from "./pages/About";
import ErrorPage from "./pages/Error";
import LayoutMain from "./components/layout/LayoutMain";

export default function AppRoutes() {
  let lang = localStorage.getItem("lang");

  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${lang}`} replace />} />
      <Route path=":lang" element={<LangWrapper />}>
        <Route element={<LayoutMain />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route
            path="testingpage"
            element={<div> this is testing page</div>}
          />
          <Route path="404" element={<ErrorPage />} />
          <Route path="*" element={<Redirect404Page />} />
        </Route>
      </Route>
    </Routes>
  );
}

function Redirect404Page() {
  const { lang } = useParams<{ lang: string | any }>();
  const allowedLangs = ["en", "ms"];
  let langStorage = localStorage.getItem("lang");
  const targetLang = allowedLangs.includes(lang) ? lang : langStorage;
  return <Navigate to={`/${targetLang}/404`} replace />;
}
```

11. Create the LangWrapper inside src
a) A React Router wrapper component that handles language-based routing and i18n initialization.
b) Functions 
--  Reads the `lang` URL parameter (`en` or `ms`).
--   Updates `localStorage` with the current language.
--   Changes the i18n language using `i18n.changeLanguage`.
--   Redirects to a valid language path if the URL parameter is invalid.
--   Renders nested routes via `<Outlet />` when the language is valid.

c) Behavior
-   If `lang` is invalid, it redirects to the language stored in `localStorage` . If local storage lang is not `en` or `ms` it defaults to `/en`.
-   Keeps the application language in sync with both URL and localStorage.
```
import { Navigate, Outlet, useParams } from "react-router";
import i18n from "./i18n";
import { useEffect } from "react";

export default function LangWrapper() {
  let { lang } = useParams<{ lang: string | any }>();
  const isValidLang = lang === "ms" || lang === "en";

  useEffect(() => {
    if (isValidLang) {
      localStorage.setItem("lang", lang!);
      i18n.changeLanguage(lang!);
    } else {
      localStorage.setItem("lang", "en");
      i18n.changeLanguage("en");
    }
  }, [lang, isValidLang]);

  if (!isValidLang) {
    let localStorageLang = localStorage.getItem("lang");
    if (localStorageLang !== "en" && localStorageLang !== "ms") {
      return <Navigate to="/en" replace />;
    }
    return <Navigate to={`/${localStorageLang}`} replace />;
  }

  return <Outlet />;
}
```
12. Update NavbarMyds to update the dropdown language from the path. Replace its code with the code from
[fe-template-c/src/components/layout/NavbarMyds.tsx](fe-template-c/src/components/layout/NavbarMyds.tsx)
a) The URL decides the language: the language select shows the `lang` URL parameter, and LangWrapper syncs it to local storage and i18n.
b) Choosing a language in the select replaces the `en` or `ms` at the start of the path and navigates to the new path.
