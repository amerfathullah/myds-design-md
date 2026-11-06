/// <reference types="node" />
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import {
  createContext,
  createElement,
  useContext,
  version,
  type Context,
} from "react";
import mitt from "mitt";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

import { createRegistry, registryKey } from "./registry";

const key = registryKey("@scope/pkg", "2.0.1");

// A second copy of React, as a second bundle of an app would carry: the same
// files, evaluated again
const require = createRequire(__filename);
function freshReact(): typeof import("react") {
  const react = require.resolve("react");
  const cached = Object.keys(require.cache).filter((file) =>
    file.startsWith(react.slice(0, react.lastIndexOf("/") + 1)),
  );
  const kept = cached.map((file) => [file, require.cache[file]] as const);
  cached.forEach((file) => delete require.cache[file]);
  try {
    return require("react");
  } finally {
    kept.forEach(([file, module]) => (require.cache[file] = module));
  }
}

// What a consumer of `context` reads with no provider above it
const read = <T>(context: Context<T>) =>
  renderToStaticMarkup(
    createElement(() => String(useContext(context)) as unknown as null),
  );

describe("copies of one major on one React", () => {
  test("share each context, and keep the first copy's default", () => {
    const global = {};
    const first = createRegistry({ key, createContext, global });
    const second = createRegistry({ key, createContext, global });

    const made = first.sharedContext("ProbeContext", "first");
    expect(second.sharedContext("ProbeContext", "second")).toBe(made);
    expect(read(made)).toBe("first");
  });
});

describe("another React copy", () => {
  test("gets its own contexts, even of the same version", () => {
    const global = {};
    const other = freshReact();
    expect(other.version).toBe(version);
    expect(other.createContext).not.toBe(createContext);

    const ours = createRegistry({ key, createContext, global });
    const theirs = createRegistry({
      key,
      createContext: other.createContext,
      global,
    });

    const made = ours.sharedContext("ProbeContext", "ours");
    const theirMade = theirs.sharedContext("ProbeContext", "theirs");
    expect(theirMade).not.toBe(made);
    expect(theirs.sharedContext("ProbeContext", "again")).toBe(theirMade);
    expect(ours.sharedContext("ProbeContext", "again")).toBe(made);
  });
});

describe("versions", () => {
  test("another minor or patch of the same major shares", () => {
    const global = {};
    const made = createRegistry({
      key: registryKey("@scope/pkg", "2.0.1"),
      createContext,
      global,
    }).sharedContext("ProbeContext", "2.0.1");
    for (const other of ["2.0.0", "2.7.3", "2.1.0-beta.4"])
      expect(
        createRegistry({
          key: registryKey("@scope/pkg", other),
          createContext,
          global,
        }).sharedContext("ProbeContext", other),
        other,
      ).toBe(made);
  });

  test("another major, or another package, shares nothing", () => {
    const global = {};
    const made = createRegistry({
      key: registryKey("@scope/pkg", "2.0.1"),
      createContext,
      global,
    }).sharedContext("ProbeContext", "2");
    for (const [name, other] of [
      ["@scope/pkg", "3.0.0"],
      ["@scope/pkg", "1.9.9"],
      ["@scope/pkg", "4.0.0-beta.0"],
      ["@scope/other", "2.0.1"],
    ] as const) {
      const theirs = createRegistry({
        key: registryKey(name, other),
        createContext,
        global,
      }).sharedContext("ProbeContext", other);
      expect(theirs, `${name}@${other}`).not.toBe(made);
      expect(read(theirs)).toBe(other);
    }
  });

  test("the key names the package, the major and the store's layout", () => {
    expect(registryKey("@scope/pkg", "2.0.1")).toBe(
      Symbol.for("@scope/pkg@2/registry-v1"),
    );
    expect(registryKey("@scope/pkg", "10.4.0-rc.1")).toBe(
      Symbol.for("@scope/pkg@10/registry-v1"),
    );
  });
});

describe("the emitter", () => {
  test("is shared like a context, and made from the caller's mitt", () => {
    const global = {};
    const first = createRegistry({ key, createContext, global });
    const second = createRegistry({ key, createContext, global });
    let made = 0;
    const counted = () => {
      made += 1;
      return mitt<{ ping: number }>();
    };

    const emitter = first.sharedEmitter("ProbeEmitter", counted);
    expect(second.sharedEmitter("ProbeEmitter", counted)).toBe(emitter);
    expect(made).toBe(1);

    const heard: number[] = [];
    emitter.on("ping", (n) => heard.push(n));
    second.sharedEmitter("ProbeEmitter", counted).emit("ping", 7);
    expect(heard).toEqual([7]);
  });

  test("of another React copy is its own", () => {
    const global = {};
    const ours = createRegistry({ key, createContext, global });
    const theirs = createRegistry({
      key,
      createContext: freshReact().createContext,
      global,
    });
    expect(theirs.sharedEmitter("ProbeEmitter", mitt)).not.toBe(
      ours.sharedEmitter("ProbeEmitter", mitt),
    );
  });
});

describe("without createContext, as in React's react-server build", () => {
  test("stores nothing: each emitter is its own, and a context fails as a direct createContext call does", () => {
    const global = {};
    const registry = createRegistry({ key, createContext: undefined, global });

    expect(registry.sharedEmitter("ProbeEmitter", mitt)).not.toBe(
      registry.sharedEmitter("ProbeEmitter", mitt),
    );
    expect(() => registry.sharedContext("ProbeContext", "x")).toThrow(
      TypeError,
    );
    expect(Reflect.ownKeys(global)).toEqual([]);
  });
});

describe("where the store can't be shared", () => {
  // Each makes a context and an emitter twice in one copy, and once in
  // another copy, and checks that nothing throws, that each copy keeps its
  // own, and that what was on the global is left as it was
  const unshared = (global: object) => {
    const before = Reflect.ownKeys(global).map((k) => [
      k,
      Reflect.get(global, k),
    ]);
    const first = createRegistry({ key, createContext, global });
    const second = createRegistry({ key, createContext, global });

    const context = first.sharedContext("ProbeContext", "first");
    expect(first.sharedContext("ProbeContext", "again")).toBe(context);
    expect(read(context)).toBe("first");
    const emitter = first.sharedEmitter("ProbeEmitter", mitt);
    expect(first.sharedEmitter("ProbeEmitter", mitt)).toBe(emitter);

    const theirs = second.sharedContext("ProbeContext", "second");
    expect(theirs).not.toBe(context);
    expect(read(theirs)).toBe("second");
    expect(second.sharedEmitter("ProbeEmitter", mitt)).not.toBe(emitter);

    expect(
      Reflect.ownKeys(global).map((k) => [k, Reflect.get(global, k)]),
    ).toEqual(before);
  };

  test("a frozen global: each copy keeps a store of its own", () => {
    unshared(Object.freeze({}));
  });

  test("a non-extensible global: each copy keeps a store of its own", () => {
    unshared(Object.preventExtensions({ other: 1 }));
  });

  test.each([
    ["a plain object", () => ({})],
    ["a Map", () => new Map()],
    ["a number", () => 2],
    ["null", () => null],
    [
      "a WeakMap holding something else for this React",
      () => new WeakMap([[createContext, { names: [] }]]),
    ],
  ])("the key holding %s: each copy keeps a store of its own", (_, value) => {
    const global = {};
    Object.defineProperty(global, key, {
      value: value(),
      enumerable: true,
      writable: true,
    });
    const held = Reflect.get(global, key);
    unshared(global);
    expect(Reflect.get(global, key)).toBe(held);
    if (held instanceof WeakMap)
      expect(held.get(createContext)).toEqual({ names: [] });
  });

  test("a global whose key can't be read: each copy keeps a store of its own", () => {
    const global = {};
    Object.defineProperty(global, key, {
      get() {
        throw new Error("no");
      },
    });
    const first = createRegistry({ key, createContext, global });
    const second = createRegistry({ key, createContext, global });
    expect(second.sharedContext("ProbeContext", 2)).not.toBe(
      first.sharedContext("ProbeContext", 1),
    );
  });
});

// Imports a module again after `vi.resetModules()`, as a second bundled copy
// of the library evaluates it again
const load = <T>(path: string): Promise<T> => import(path);

describe("the library's own copy", () => {
  const pkg = JSON.parse(
    readFileSync(resolve(__dirname, "../../package.json"), "utf8"),
  ) as { name: string; version: string };

  test("stores on globalThis under the package's name and major, keyed by React's createContext", async () => {
    const { sharedContext } =
      await load<typeof import("./registry")>("./registry");
    const made = sharedContext("OwnProbeContext", "own");

    const store: unknown = Reflect.get(
      globalThis,
      Symbol.for(`${pkg.name}@${pkg.version.split(".")[0]}/registry-v1`),
    );
    expect(store).toBeInstanceOf(WeakMap);
    const names = (store as WeakMap<object, unknown>).get(createContext);
    expect(names).toBeInstanceOf(Map);
    expect((names as Map<string, unknown>).get("OwnProbeContext")).toBe(made);
  });

  test("re-evaluated, as by a second bundled copy, shares and keeps the first default", async () => {
    vi.resetModules();
    const first = await load<typeof import("./registry")>("./registry");
    const made = first.sharedContext("ReloadedProbeContext", "first");

    vi.resetModules();
    const second = await load<typeof import("./registry")>("./registry");
    expect(second.sharedContext).not.toBe(first.sharedContext);
    expect(second.sharedContext("ReloadedProbeContext", "second")).toBe(made);
    expect(read(made)).toBe("first");
  });

  test("a module that makes a context, re-evaluated, gets the context it made first", async () => {
    vi.resetModules();
    const first =
      await load<typeof import("../hooks/use-theme")>("../hooks/use-theme");
    vi.resetModules();
    const second =
      await load<typeof import("../hooks/use-theme")>("../hooks/use-theme");
    expect(second.useTheme).not.toBe(first.useTheme);
    expect(second.ThemeContext).toBe(first.ThemeContext);
  });
});
