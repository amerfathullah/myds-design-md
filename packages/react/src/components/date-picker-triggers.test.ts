// @vitest-environment happy-dom
// The names of DatePicker's and DateRangePicker's triggers, and what
// `disabled` does to them. Each picker renders its triggers twice, Dialog
// triggers for below `lg:` and Popover triggers from `lg:` up, so
// `aria-labelledby`, `aria-label` and `aria-describedby` reach every trigger,
// and none of the calendars. A trigger is named by the label, then by what it
// shows. `disabled={true}` disables every trigger; any other `disabled`
// leaves them enabled and disables only the days it matches.
import { act, createElement, Fragment, type ReactElement } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import {
  computeAccessibleDescription,
  computeAccessibleName,
} from "dom-accessibility-api";
import type { Matcher } from "react-day-picker";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { DatePicker } from "./date-picker";
import { DateRangePicker } from "./daterange-picker";
import { Label } from "./label";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const unmounts: (() => Promise<void>)[] = [];

// Mounts `element` in a container on the page, as an app would, and returns
// the container. The dialogs and popovers portal into `<body>`, outside it.
async function mount(element: ReactElement) {
  const container = document.body.appendChild(document.createElement("div"));
  const root = createRoot(container);
  unmounts.push(async () => {
    await act(async () => root.unmount());
    container.remove();
  });
  await act(async () => root.render(element));
  return container;
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

// No test logs an error or a warning, and nothing is left on the page
afterEach(async () => {
  while (unmounts.length) await unmounts.pop()!();
  const logged = [
    ...vi.mocked(console.error).mock.calls,
    ...vi.mocked(console.warn).mock.calls,
  ];
  vi.restoreAllMocks();
  expect(logged).toEqual([]);
  expect(document.body.innerHTML).toBe("");
});

// The triggers in `page`, in the order the pickers render them: DatePicker
// its dialog's trigger, then its popover's; DateRangePicker its dialogs' From
// and To triggers, then its popovers'
const triggersOf = (page: ParentNode) => [...page.querySelectorAll("button")];

// The accessible names of the triggers in `page`
const triggerNames = (page: ParentNode) =>
  triggersOf(page).map((button) => computeAccessibleName(button));

// The accessible descriptions of the triggers in `page`
const triggerDescriptions = (page: ParentNode) =>
  triggersOf(page).map((button) => computeAccessibleDescription(button));

// The naming attributes each trigger in `page` has
const namingAttributes = (page: ParentNode) =>
  triggersOf(page).map((button) =>
    ["aria-labelledby", "aria-label", "aria-describedby"].filter((name) =>
      button.hasAttribute(name),
    ),
  );

const october1 = new Date(2026, 9, 1);
const october30 = new Date(2026, 9, 30);
const range = { from: october1, to: october30 };

// A Label with the id "label" and the text `label`, a hint with the id
// "hint", then `picker`
const field = (label: string, picker: ReactElement) =>
  createElement(
    Fragment,
    null,
    createElement(Label, { id: "label" }, label),
    createElement("p", { id: "hint" }, "No earlier than 1 Jan 1950"),
    picker,
  );

// All three naming props, for the Label and hint `field` renders
const named = {
  "aria-labelledby": "label",
  "aria-label": "Tarikh",
  "aria-describedby": "hint",
};

// Opens the calendar behind trigger number `index` in `page`, and returns
// every element in the open dialog or popover that carries a naming prop
// `named` passes: its `aria-label`, or the id "label" or "hint" in an
// `aria-labelledby` or `aria-describedby`, as "<tag> <attribute>"
async function namingInOpenCalendar(page: HTMLElement, index: number) {
  await act(async () => triggersOf(page)[index]!.click());
  const [open, ...others] = document.querySelectorAll('[role="dialog"]');
  expect(others).toEqual([]);
  expect(open).toBeDefined();
  // The calendar's root, react-day-picker's, is the element with `lang`
  expect(open!.querySelector("[lang]")).not.toBeNull();
  return [open!, ...open!.querySelectorAll("*")].flatMap((element) =>
    [
      element.getAttribute("aria-label") === named["aria-label"] &&
        "aria-label",
      ...(["aria-labelledby", "aria-describedby"] as const).filter((name) =>
        (element.getAttribute(name) ?? "")
          .split(/\s+/)
          .some((id) => id === "label" || id === "hint"),
      ),
    ]
      .filter(Boolean)
      .map((name) => `${element.tagName.toLowerCase()} ${name}`),
  );
}

describe("DatePicker's triggers", () => {
  test("are named by the Label `aria-labelledby` names, then the date they show", async () => {
    const page = await mount(
      field(
        "Date of birth",
        createElement(DatePicker, {
          value: october30,
          "aria-labelledby": "label",
        }),
      ),
    );
    expect(triggerNames(page)).toEqual([
      "Date of birth 30 Oct 2026",
      "Date of birth 30 Oct 2026",
    ]);
  });

  test("are named by the Label, then the placeholder, with no date", async () => {
    const page = await mount(
      field(
        "Date of birth",
        createElement(DatePicker, { "aria-labelledby": "label" }),
      ),
    );
    expect(triggerNames(page)).toEqual([
      "Date of birth dd / mm / yyyy",
      "Date of birth dd / mm / yyyy",
    ]);
  });

  test("are named by `aria-label`, then the date they show", async () => {
    const page = await mount(
      createElement(DatePicker, {
        value: october30,
        locale: "ms",
        "aria-label": "Tarikh lahir",
      }),
    );
    expect(triggerNames(page)).toEqual([
      "Tarikh lahir 30 Okt 2026",
      "Tarikh lahir 30 Okt 2026",
    ]);
  });

  test("are named by the Label when `aria-labelledby` and `aria-label` are both passed", async () => {
    const page = await mount(
      field(
        "Date of birth",
        createElement(DatePicker, {
          value: october30,
          "aria-labelledby": "label",
          "aria-label": "Tarikh lahir",
        }),
      ),
    );
    expect(triggerNames(page)).toEqual([
      "Date of birth 30 Oct 2026",
      "Date of birth 30 Oct 2026",
    ]);
  });

  test("are described by the element `aria-describedby` names", async () => {
    const page = await mount(
      field(
        "Date of birth",
        createElement(DatePicker, { "aria-describedby": "hint" }),
      ),
    );
    expect(triggerDescriptions(page)).toEqual([
      "No earlier than 1 Jan 1950",
      "No earlier than 1 Jan 1950",
    ]);
  });

  test("without the naming props, are named by what they show and take no `aria-labelledby` or `aria-describedby`", async () => {
    const page = await mount(createElement(DatePicker, { value: october30 }));
    expect(triggerNames(page)).toEqual(["30 Oct 2026", "30 Oct 2026"]);
    expect(namingAttributes(page)).toEqual([[], []]);
  });

  test.each([
    ["dialog", 0],
    ["popover", 1],
  ])(
    "don't pass the naming props to the calendar in the %s",
    async (_, trigger) => {
      const page = await mount(
        field(
          "Date of birth",
          createElement(DatePicker, { value: october30, ...named }),
        ),
      );
      expect(await namingInOpenCalendar(page, trigger)).toEqual([]);
    },
  );
});

describe("DateRangePicker's triggers", () => {
  test.each([
    [
      "the default prefixes",
      {},
      ["Travel dates From: 01 Oct 2026", "Travel dates To: 30 Oct 2026"],
    ],
    [
      "`fromLabel` and `toLabel`",
      { fromLabel: "Bermula:", toLabel: "Berakhir:" },
      [
        "Travel dates Bermula: 01 Oct 2026",
        "Travel dates Berakhir: 30 Oct 2026",
      ],
    ],
    [
      '`locale="ms"`',
      { locale: "ms" as const },
      ["Travel dates Dari: 01 Okt 2026", "Travel dates Hingga: 30 Okt 2026"],
    ],
  ])(
    "are named by the Label `aria-labelledby` names, then the prefix and date they show, with %s",
    async (_, props, [from, to]) => {
      const page = await mount(
        field(
          "Travel dates",
          createElement(DateRangePicker, {
            value: range,
            "aria-labelledby": "label",
            ...props,
          }),
        ),
      );
      expect(triggerNames(page)).toEqual([from, to, from, to]);
    },
  );

  test("are named by the Label, then the prefix and the placeholder, with no dates", async () => {
    const page = await mount(
      field(
        "Travel dates",
        createElement(DateRangePicker, { "aria-labelledby": "label" }),
      ),
    );
    const from = "Travel dates From: dd / mm / yyyy";
    const to = "Travel dates To: dd / mm / yyyy";
    expect(triggerNames(page)).toEqual([from, to, from, to]);
  });

  test("are named by `aria-label`, then the prefix and date they show", async () => {
    const page = await mount(
      createElement(DateRangePicker, {
        value: range,
        locale: "ms",
        "aria-label": "Tarikh perjalanan",
      }),
    );
    const from = "Tarikh perjalanan Dari: 01 Okt 2026";
    const to = "Tarikh perjalanan Hingga: 30 Okt 2026";
    expect(triggerNames(page)).toEqual([from, to, from, to]);
  });

  test("are named by the Label when `aria-labelledby` and `aria-label` are both passed", async () => {
    const page = await mount(
      field(
        "Travel dates",
        createElement(DateRangePicker, {
          value: range,
          "aria-labelledby": "label",
          "aria-label": "Tarikh perjalanan",
        }),
      ),
    );
    const from = "Travel dates From: 01 Oct 2026";
    const to = "Travel dates To: 30 Oct 2026";
    expect(triggerNames(page)).toEqual([from, to, from, to]);
  });

  test("are described by the element `aria-describedby` names", async () => {
    const page = await mount(
      field(
        "Travel dates",
        createElement(DateRangePicker, { "aria-describedby": "hint" }),
      ),
    );
    expect(triggerDescriptions(page)).toEqual(
      Array(4).fill("No earlier than 1 Jan 1950"),
    );
  });

  test("without the naming props, are named by what they show and take no `aria-labelledby` or `aria-describedby`", async () => {
    const page = await mount(createElement(DateRangePicker, { value: range }));
    const from = "From: 01 Oct 2026";
    const to = "To: 30 Oct 2026";
    expect(triggerNames(page)).toEqual([from, to, from, to]);
    expect(namingAttributes(page)).toEqual([[], [], [], []]);
  });

  test.each([
    ["From dialog", 0],
    ["To dialog", 1],
    ["From popover", 2],
    ["To popover", 3],
  ])(
    "don't pass the naming props to the calendar in the %s",
    async (_, trigger) => {
      const page = await mount(
        field(
          "Travel dates",
          createElement(DateRangePicker, { value: range, ...named }),
        ),
      );
      expect(await namingInOpenCalendar(page, trigger)).toEqual([]);
    },
  );
});

// Two of each picker, one named by a Label and described by a hint, the
// other named by `aria-label`
const twoOfEach = () =>
  field(
    "Dates",
    createElement(
      Fragment,
      null,
      createElement(DatePicker, {
        "aria-labelledby": "label",
        "aria-describedby": "hint",
      }),
      createElement(DatePicker, { "aria-label": "Tarikh lahir" }),
      createElement(DateRangePicker, {
        "aria-labelledby": "label",
        "aria-describedby": "hint",
      }),
      createElement(DateRangePicker, { "aria-label": "Tarikh perjalanan" }),
    ),
  );

describe("Both pickers", () => {
  test("give every element a unique id, and reference only ids on the page, with two of each on one page", async () => {
    await mount(twoOfEach());
    const ids = [...document.querySelectorAll("[id]")].map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);
    const references = [
      ...document.querySelectorAll(
        "[aria-labelledby], [aria-describedby], [aria-controls]",
      ),
    ].flatMap((element) =>
      ["aria-labelledby", "aria-describedby", "aria-controls"].flatMap(
        (name) => element.getAttribute(name)?.split(/\s+/) ?? [],
      ),
    );
    // Each of the 12 triggers names its label and its text
    expect(references.length).toBeGreaterThanOrEqual(24);
    expect(references.filter((id) => !document.getElementById(id))).toEqual([]);
  });

  test("give their triggers the same classes and text with the naming props as without", async () => {
    const looks = (page: ParentNode) =>
      triggersOf(page).map((button) => ({
        classes: [button, ...button.querySelectorAll("*")].map((element) =>
          element.getAttribute("class"),
        ),
        text: button.textContent,
      }));
    const pickers = [
      (props: Partial<typeof named>) =>
        createElement(DatePicker, { value: october30, ...props }),
      (props: Partial<typeof named>) =>
        createElement(DateRangePicker, { value: range, ...props }),
    ];
    for (const picker of pickers) {
      const bare = await mount(picker({}));
      const labelled = await mount(field("Dates", picker(named)));
      expect(looks(labelled)).toEqual(looks(bare));
    }
  });

  test("keep the triggers' names when React hydrates them from server HTML", async () => {
    const container = document.body.appendChild(document.createElement("div"));
    container.innerHTML = renderToString(twoOfEach());
    const serverNames = triggerNames(container);
    const recoverable: unknown[] = [];
    const root = await act(async () =>
      hydrateRoot(container, twoOfEach(), {
        onRecoverableError: (error) => recoverable.push(error),
      }),
    );
    unmounts.push(async () => {
      await act(async () => root.unmount());
      container.remove();
    });
    expect(recoverable).toEqual([]);
    expect(triggerNames(container)).toEqual(serverNames);
    expect(serverNames).toEqual([
      "Dates dd / mm / yyyy",
      "Dates dd / mm / yyyy",
      "Tarikh lahir dd / mm / yyyy",
      "Tarikh lahir dd / mm / yyyy",
      "Dates From: dd / mm / yyyy",
      "Dates To: dd / mm / yyyy",
      "Dates From: dd / mm / yyyy",
      "Dates To: dd / mm / yyyy",
      "Tarikh perjalanan From: dd / mm / yyyy",
      "Tarikh perjalanan To: dd / mm / yyyy",
      "Tarikh perjalanan From: dd / mm / yyyy",
      "Tarikh perjalanan To: dd / mm / yyyy",
    ]);
  });
});

// What a trigger shows and what names and describes it, so an enabled and a
// disabled picker's triggers can be compared: its classes and its
// descendants', its text, its accessible name and description, and the text
// of each element its `aria-labelledby` and `aria-describedby` reference. The
// referenced ids differ between two pickers, so their text stands in for
// them.
const triggerLooks = (page: ParentNode) =>
  triggersOf(page).map((button) => {
    const referenced = (name: string) =>
      button.hasAttribute(name)
        ? button
            .getAttribute(name)!
            .split(/\s+/)
            .map((id) => document.getElementById(id)?.textContent ?? null)
        : null;
    return {
      classes: [button, ...button.querySelectorAll("*")].map((element) =>
        element.getAttribute("class"),
      ),
      text: button.textContent,
      name: computeAccessibleName(button),
      description: computeAccessibleDescription(button),
      labelledBy: referenced("aria-labelledby"),
      describedBy: referenced("aria-describedby"),
    };
  });

// Mounts `element`, returns `read` of its container, and unmounts it, so the
// next picker mounted can reuse the Label's and hint's ids
async function readMounted<T>(
  element: ReactElement,
  read: (page: HTMLElement) => T,
) {
  const page = await mount(element);
  const result = read(page);
  await unmounts.pop()!();
  return result;
}

// The number of dialogs and popovers open on the page
const openCount = () => document.querySelectorAll('[role="dialog"]').length;

// The days the open calendar shows, by their `data-day` ("2026-10-01"), and
// those of them it disables
function calendarDays() {
  const [calendar, ...others] = document.querySelectorAll(
    '[role="dialog"] [lang]',
  );
  expect(others).toEqual([]);
  expect(calendar).toBeDefined();
  const days = [...calendar!.querySelectorAll("[data-day]")];
  return {
    shown: days.map((day) => day.getAttribute("data-day")!),
    disabled: days
      .filter((day) => day.hasAttribute("data-disabled"))
      .map((day) => day.getAttribute("data-day")!),
  };
}

// The date a `data-day` names, at midnight local time, as the pickers' dates
const dateOf = (isoDate: string) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year!, month! - 1, day);
};

const october13 = new Date(2026, 9, 13);
const october15 = new Date(2026, 9, 15);

// The `disabled` values other than `true`, as props, each with the days it
// matches. Each leaves the triggers enabled and disables only those days.
// `[true]` matches every day; #231 may make it disable the triggers too.
const dayMatchers: [
  string,
  { disabled?: Matcher | Matcher[] },
  (day: Date) => boolean,
][] = [
  [
    "`{ before: date }`",
    { disabled: { before: october15 } },
    (day) => day < october15,
  ],
  [
    "`{ dayOfWeek: [0, 6] }`",
    { disabled: { dayOfWeek: [0, 6] } },
    (day) => day.getDay() === 0 || day.getDay() === 6,
  ],
  [
    "a function matcher",
    { disabled: (day: Date) => day.getDate() === 13 },
    (day) => day.getDate() === 13,
  ],
  [
    "an array of matchers",
    { disabled: [{ dayOfWeek: [0] }, october13] },
    (day) => day.getDay() === 0 || day.getTime() === october13.getTime(),
  ],
  ["`[true]`", { disabled: [true] }, () => true],
  ["`false`", { disabled: false }, () => false],
  ["no `disabled`", {}, () => false],
];

// Each picker with a date in October 2026, so each calendar opens on that
// month, and its triggers in the order it renders them, each with the days
// its calendar disables whatever `disabled` is: DateRangePicker's From
// calendars the days after `to`, and its To calendars those before `from`
const pickers = {
  DatePicker: {
    render: (props: object) =>
      createElement(DatePicker, { value: october30, ...props }),
    triggers: [
      ["dialog", () => false],
      ["popover", () => false],
    ] as [string, (day: Date) => boolean][],
  },
  DateRangePicker: {
    render: (props: object) =>
      createElement(DateRangePicker, { value: range, ...props }),
    triggers: [
      ["From dialog", (day) => day > october30],
      ["To dialog", (day) => day < october1],
      ["From popover", (day) => day > october30],
      ["To popover", (day) => day < october1],
    ] as [string, (day: Date) => boolean][],
  },
};

// JSX's bare `disabled` passes `true`, as `disabled={true}` does
describe("`disabled={true}`", () => {
  test.each([
    ["no value", {}],
    ["`defaultValue`", { defaultValue: range }],
    ["a controlled `value`", { value: range }],
  ])(
    "disables all four of DateRangePicker's triggers, which open nothing, with %s",
    async (_, props) => {
      const onValueChange = vi.fn();
      const page = await mount(
        createElement(DateRangePicker, {
          ...props,
          onValueChange,
          disabled: true,
        }),
      );
      const triggers = triggersOf(page);
      expect(triggers.map((trigger) => trigger.disabled)).toEqual([
        true,
        true,
        true,
        true,
      ]);
      const opened = [];
      for (const trigger of triggers) {
        await act(async () => trigger.click());
        opened.push(openCount());
      }
      expect(opened).toEqual([0, 0, 0, 0]);
      expect(onValueChange).not.toHaveBeenCalled();
    },
  );

  test.each([
    ["no value", {}],
    ["a value", { value: october30 }],
  ])(
    "disables both of DatePicker's triggers, which open nothing, with %s",
    async (_, props) => {
      const onValueChange = vi.fn();
      const page = await mount(
        createElement(DatePicker, { ...props, onValueChange, disabled: true }),
      );
      const triggers = triggersOf(page);
      expect(triggers.map((trigger) => trigger.disabled)).toEqual([true, true]);
      const opened = [];
      for (const trigger of triggers) {
        await act(async () => trigger.click());
        opened.push(openCount());
      }
      expect(opened).toEqual([0, 0]);
      expect(onValueChange).not.toHaveBeenCalled();
    },
  );

  // A Label and hint for `field` to name and describe the picker, or the
  // naming props that need neither, with each prop that changes the text
  test.each([
    [
      "DatePicker",
      "`aria-labelledby` and `aria-describedby`",
      true,
      {
        "aria-labelledby": "label",
        "aria-describedby": "hint",
      },
    ],
    [
      "DatePicker",
      '`aria-label` and `locale="ms"`',
      false,
      {
        locale: "ms",
        "aria-label": "Tarikh lahir",
      },
    ],
    ["DatePicker", "no naming props", false, {}],
    [
      "DateRangePicker",
      "`aria-labelledby` and `aria-describedby`",
      true,
      {
        "aria-labelledby": "label",
        "aria-describedby": "hint",
      },
    ],
    [
      "DateRangePicker",
      '`aria-label` and `locale="ms"`',
      false,
      {
        locale: "ms",
        "aria-label": "Tarikh perjalanan",
      },
    ],
    [
      "DateRangePicker",
      "`fromLabel` and `toLabel`",
      true,
      {
        fromLabel: "Check-in:",
        toLabel: "Check-out:",
        "aria-labelledby": "label",
      },
    ],
    ["DateRangePicker", "no naming props", false, {}],
  ] as const)(
    "disables %s's triggers but keeps their classes, text, names and descriptions, with %s",
    async (picker, _, inField, props) => {
      const render = (disabled: object) => {
        const element = pickers[picker].render({ ...props, ...disabled });
        return inField ? field("Dates", element) : element;
      };
      // Each trigger's native `disabled`, then what it shows and what names
      // and describes it
      const read = (page: HTMLElement) => ({
        disabled: triggersOf(page).map((trigger) => trigger.disabled),
        looks: triggerLooks(page),
      });
      const enabled = await readMounted(render({}), read);
      const disabled = await readMounted(render({ disabled: true }), read);
      const count = pickers[picker].triggers.length;
      expect(enabled.disabled).toEqual(Array(count).fill(false));
      expect(disabled.disabled).toEqual(Array(count).fill(true));
      expect(disabled.looks).toEqual(enabled.looks);
    },
  );
});

describe("Every other `disabled` value", () => {
  test.each(
    Object.entries(pickers).flatMap(([picker, { triggers }]) =>
      triggers.flatMap(([trigger, bound], index) =>
        dayMatchers.map(
          ([value, props, matches]) =>
            [picker, trigger, value, index, props, matches, bound] as const,
        ),
      ),
    ),
  )(
    "leaves %s's %s trigger enabled with %s, and its calendar disables only the days that matches",
    async (picker, _, __, index, props, matches, bound) => {
      const page = await mount(
        pickers[picker as keyof typeof pickers].render(props),
      );
      const trigger = triggersOf(page)[index]!;
      expect(trigger.disabled).toBe(false);
      await act(async () => trigger.click());
      expect(openCount()).toBe(1);
      const { shown, disabled } = calendarDays();
      // October 2026, Sunday 27 September to Saturday 31 October
      expect(shown.length).toBe(35);
      expect(disabled).toEqual(
        shown.filter((day) => matches(dateOf(day)) || bound(dateOf(day))),
      );
    },
  );

  test("`{ dayOfWeek: [0, 6] }` disables only the weekends and the days after `to` in DateRangePicker's From calendar", async () => {
    const page = await mount(
      createElement(DateRangePicker, {
        value: range,
        disabled: { dayOfWeek: [0, 6] },
      }),
    );
    await act(async () => triggersOf(page)[0]!.click());
    expect(calendarDays().disabled).toEqual([
      "2026-09-27",
      "2026-10-03",
      "2026-10-04",
      "2026-10-10",
      "2026-10-11",
      "2026-10-17",
      "2026-10-18",
      "2026-10-24",
      "2026-10-25",
      "2026-10-31",
    ]);
  });
});
