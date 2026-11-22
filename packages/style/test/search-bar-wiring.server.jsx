// The server half of search-bar-wiring.page.jsx: renders one of its
// compositions to HTML, as a server does, for the page to hydrate. The test
// bundles this file with esbuild for Node, where there's no `window`.
import { version } from "react";
import { renderToString } from "react-dom/server";

import { Page } from "./search-bar-wiring.page.jsx";

export { version };

/**
 * @param {string} name a composition's name
 * @returns {string} its server HTML
 */
export const render = (name) => renderToString(<Page name={name} />);
