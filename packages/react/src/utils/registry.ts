import type { Emitter, EventType } from "mitt";
import * as React from "react";
import type { Context, createContext as CreateContext } from "react";

// One of each context, and one toast emitter, for every bundled copy of the
// library on one React (#119, #235). The CommonJS build inlines every module
// into each entry that imports it, and an app can load some entries through
// `import` and others through `require`. A context made at module scope would
// then exist once per copy, and a provider from one entry would never reach a
// consumer from another. So `sharedContext` makes every context and
// `sharedEmitter` the emitter, and both keep what they make in one store that
// every copy of the same major finds on `globalThis`:
//
//   globalThis[Symbol.for("<package name>@<major>/registry-v1")]:
//     WeakMap<React's createContext, Map<name, context or emitter>>
//
// It's keyed by `createContext` because that's one object per React copy,
// under `import`, `require` and bundler interop alike, and two copies of one
// React version still differ. Separate React copies, and different majors,
// share nothing.
//
// Every minor and patch of a major shares the store, and the copy that loads
// first makes each object, default value and all. So within a major:
// - the key, the store's layout and every name are frozen;
// - a field added to a context's value must be optional, and each reader must
//   fall back when it's missing;
// - a change an older copy can't handle needs a new name.
// `registry.guard.test.ts` keeps each name and default value under review.

// The package's name and version, from its package.json, which tsup and
// Vitest put in (`define`)
declare const __MYDS_REACT_NAME__: string;
declare const __MYDS_REACT_VERSION__: string;

type Names = Map<string, unknown>;

export interface RegistryOptions {
  key: symbol;
  createContext: typeof CreateContext | undefined;
  global: object;
}

export const registryKey = (name: string, version: string): symbol =>
  Symbol.for(`${name}@${version.split(".")[0]}/registry-v1`);

// The names stored for this React copy. Where the global can't hold the
// store, or holds something else under the key, this copy keeps names of its
// own, so each copy has its own objects, as before the registry.
function namesFor(
  global: object,
  key: symbol,
  createContext: typeof CreateContext,
): Names {
  try {
    if (!(key in global))
      Object.defineProperty(global, key, { value: new WeakMap() });
    const store: unknown = (global as Record<symbol, unknown>)[key];
    if (store instanceof WeakMap) {
      if (!store.has(createContext)) store.set(createContext, new Map());
      const names: unknown = store.get(createContext);
      if (names instanceof Map) return names;
    }
  } catch {
    // A frozen or non-extensible global, or a key that throws when read
  }
  return new Map();
}

export function createRegistry({
  key,
  createContext,
  global,
}: RegistryOptions) {
  // Without `createContext`, as in React's react-server build, nothing is
  // stored: a context fails to be made as a direct call does
  const names = createContext && namesFor(global, key, createContext);

  const shared = <T>(name: string, make: () => T): T => {
    if (!names) return make();
    if (!names.has(name)) names.set(name, make());
    return names.get(name) as T;
  };

  return {
    sharedContext: <T>(name: string, defaultValue: T): Context<T> =>
      shared(name, () => createContext!(defaultValue)),
    sharedEmitter: <Events extends Record<EventType, unknown>>(
      name: string,
      mitt: () => Emitter<Events>,
    ): Emitter<Events> => shared(name, mitt),
  };
}

export const { sharedContext, sharedEmitter } = createRegistry({
  key: registryKey(__MYDS_REACT_NAME__, __MYDS_REACT_VERSION__),
  createContext: React.createContext,
  global: typeof globalThis === "object" ? globalThis : {},
});
