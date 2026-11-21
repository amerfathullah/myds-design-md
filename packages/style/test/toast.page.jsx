// The page toast.test.mjs renders in Chromium: a default AutoToast, as an
// app renders one, with no toast shown. `window.fire(variant, title)` fires
// a toast of that Variant through the library's toast hook, as an app fires
// one. The page is ready once AutoToast listens for toasts. The test bundles
// this file with esbuild.
import { useEffect } from "react";
import { createRoot } from "react-dom/client";

import { AutoToast } from "../../react/src/components/toast";
import { useToast } from "../../react/src/hooks";

window.ready = [];

function Page() {
  const { toast } = useToast();
  // AutoToast listens for toasts in its own effect, which runs before this
  // one, its parent's
  useEffect(() => {
    window.fire = (variant, title) => toast({ variant, title });
    window.ready.push("page");
  }, []);
  return <AutoToast />;
}

createRoot(document.getElementById("root")).render(<Page />);
