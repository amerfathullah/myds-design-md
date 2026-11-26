// The page radio-disabled.test.mjs renders in Chromium: each fixture of
// radio-disabled.cases.mjs, a Radio in a form of its own, inside a disabled
// fieldset, a fieldset the test disables once the page has rendered, the
// first legend of a disabled fieldset, a consumer's `group` beside disabled
// controls, or nothing. `mount` renders the fixtures. `ServerPage` renders the
// server fixtures, which radio-disabled.server.jsx renders to HTML in Node,
// and `hydrate` hydrates that HTML, pushing React's recoverable errors to
// `window.recoverableErrors`. Either sets `window.ready` once React has
// committed the page. The test bundles this file with esbuild, for the
// browser as `radioDisabled`.
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { useEffect, version } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";

import { Button as LibraryButton } from "../../react/src/components/button";
import {
  Radio,
  RadioButton,
  RadioHintText,
  RadioItem,
  RadioLabel,
} from "../../react/src/components/radio";
import { fixtures, serverFixtures } from "./radio-disabled.cases.mjs";

export { version };

// What an option's label and hint say: the outer or lone option's, and the
// nested one's
const texts = {
  outer: ["Apple", "Crisp and sweet"],
  inner: ["Banana", "Soft and ripe"],
};

// An option in the docs' layout: a RadioItem holding the button, then a
// `div.grid` holding the label and hint, unless `flat` puts them directly in
// RadioItem. `children` goes after the hint. `raw` renders Radix's own Item,
// which never reports to RadioItem, in place of RadioButton.
function Option({
  name,
  text = texts.outer,
  item,
  button,
  label,
  hint,
  raw,
  flat,
  libraryButton,
  children,
}) {
  const Button = raw ? RadioGroupPrimitive.Item : RadioButton;
  const content = (
    <>
      <RadioLabel
        htmlFor={`${name}-radio`}
        data-test={`${name}-label`}
        {...label}
      >
        {text[0]}
      </RadioLabel>
      <RadioHintText data-test={`${name}-hint`} {...hint}>
        {text[1]}
      </RadioHintText>
      {children}
    </>
  );
  return (
    <RadioItem {...item}>
      <Button
        value={name}
        id={`${name}-radio`}
        data-test={`${name}-radio`}
        {...button}
      />
      {flat ? content : <div className="grid">{content}</div>}
      {libraryButton && (
        <LibraryButton variant="default-outline" disabled>
          Other
        </LibraryButton>
      )}
    </RadioItem>
  );
}

// What a fixture's box holds, by its `shape`
const shapes = {
  option: ({ id, size, props, flat, libraryButton }) => (
    <Radio size={size} {...props.radio}>
      <Option name={id} {...props} flat={flat} libraryButton={libraryButton} />
    </Radio>
  ),
  raw: ({ id, props }) => (
    <Radio {...props.radio}>
      <Option name={id} {...props} raw />
    </Radio>
  ),
  two: ({ id }) => (
    <Radio>
      <RadioItem>
        <RadioButton
          value="apple"
          id={`${id}-radio`}
          data-test={`${id}-radio`}
        />
        <RadioButton
          value="cherry"
          aria-label="Cherry"
          data-test={`${id}-second-radio`}
          disabled
        />
        <div className="grid">
          <RadioLabel htmlFor={`${id}-radio`}>Apple</RadioLabel>
          <RadioHintText>Crisp and sweet</RadioHintText>
        </div>
      </RadioItem>
    </Radio>
  ),
  nested: ({ id, props }) => (
    <Radio {...props.radio}>
      <Option name={`${id}-outer`} {...props}>
        <Radio {...props.inner?.radio}>
          <Option name={`${id}-inner`} text={texts.inner} {...props.inner} />
        </Radio>
      </Option>
    </Radio>
  ),
  "nested-bare": ({ id, props }) => (
    <Radio {...props.radio}>
      <Option name={`${id}-outer`} {...props}>
        <Radio {...props.inner?.radio}>
          <RadioButton
            value="banana"
            id={`${id}-inner-radio`}
            data-test={`${id}-inner-radio`}
            {...props.inner?.button}
          />
          <RadioLabel
            htmlFor={`${id}-inner-radio`}
            data-test={`${id}-inner-label`}
          >
            {texts.inner[0]}
          </RadioLabel>
        </Radio>
      </Option>
    </Radio>
  ),
  "nested-fieldset": ({ id, props }) => (
    <Radio {...props.radio}>
      <Option name={`${id}-outer`} {...props}>
        <fieldset disabled>
          <Radio>
            <Option name={`${id}-inner`} text={texts.inner} />
          </Radio>
        </fieldset>
      </Option>
    </Radio>
  ),
};

// The disabled controls a consumer's group holds beside the Radio
const disabledControls = (
  <>
    <LibraryButton variant="default-outline" disabled>
      Other
    </LibraryButton>
    <input type="checkbox" aria-label="Other" disabled />
  </>
);

// What a fixture's Radio sits in, by its `wrap`
const wraps = {
  none: (control) => control,
  fieldset: (control) => <fieldset disabled>{control}</fieldset>,
  "fieldset-group": (control) => (
    <fieldset disabled className="group">
      {control}
    </fieldset>
  ),
  nested: (control) => (
    <fieldset disabled>
      <fieldset>{control}</fieldset>
    </fieldset>
  ),
  "nested-inner": (control) => (
    <fieldset>
      <fieldset disabled>{control}</fieldset>
    </fieldset>
  ),
  late: (control) => <fieldset data-late>{control}</fieldset>,
  legend: (control) => (
    <fieldset disabled>
      <legend>{control}</legend>
      <input aria-label="Other" />
    </fieldset>
  ),
  "legend-group": (control) => (
    <fieldset disabled className="group">
      <legend>{control}</legend>
      <input aria-label="Other" />
    </fieldset>
  ),
  "group-sibling": (control) => (
    <div className="group" data-disabled="">
      {disabledControls}
      {control}
    </div>
  ),
  "named-group-sibling": (control) => (
    <div className="group/radio-item" data-disabled="">
      {disabledControls}
      {control}
    </div>
  ),
};

function Fixture(fixture) {
  return (
    <div data-test={fixture.id} style={{ margin: 16, width: 320 }}>
      <form onSubmit={(event) => event.preventDefault()}>
        {wraps[fixture.wrap ?? "none"](shapes[fixture.shape](fixture))}
      </form>
    </div>
  );
}

function Fixtures({ list }) {
  useEffect(() => void (window.ready = true), []);
  return (
    <main style={{ display: "flex", flexWrap: "wrap" }}>
      {list.map((fixture) => (
        <Fixture key={fixture.id} {...fixture} />
      ))}
    </main>
  );
}

export const ServerPage = () => (
  <Fixtures
    list={serverFixtures.map((fixture) => ({ ...fixture, shape: "option" }))}
  />
);

export function mount() {
  window.ready = false;
  createRoot(document.getElementById("root")).render(
    <Fixtures list={fixtures} />,
  );
}

export function hydrate() {
  window.ready = false;
  window.recoverableErrors = [];
  hydrateRoot(document.getElementById("root"), <ServerPage />, {
    onRecoverableError: (error) => window.recoverableErrors.push(String(error)),
  });
}
