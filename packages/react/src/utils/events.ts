import mitt from "mitt";
import type { ToastEvent } from "../components/toast";
import { sharedEmitter } from "./registry";
/*========================================================================================================================*/

type Events = {
  "toast.add": ToastEvent;
};

export const emitter = sharedEmitter<Events>("emitter", mitt);
