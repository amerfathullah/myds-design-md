// The server half of radio-disabled.page.jsx: renders its server fixtures to
// HTML, as a server does, for the page to hydrate. The test bundles this file
// with esbuild for Node, where there's no `window`.
import { version } from "react";
import { renderToString } from "react-dom/server";

import { ServerPage } from "./radio-disabled.page.jsx";

export { version };

/** @returns {string} the server fixtures' HTML */
export const render = () => renderToString(<ServerPage />);
