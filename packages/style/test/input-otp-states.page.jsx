// The page input-otp-states.test.mjs renders in Chromium: InputOTPs, rendered
// by the React components themselves, so the page has the container, the
// hidden <input> and the data attributes input-otp really renders. Each
// InputOTP shows its own state, or sits beside, or among its own children,
// another control that is invalid or disabled. `data-test` names each
// InputOTP's input, and `data-otp-slot` its slots. The test bundles this file
// with esbuild.
import { createRoot } from "react-dom/client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../react/src/components/accordion";
import { Button } from "../../react/src/components/button";
import { Input } from "../../react/src/components/input";
import { InputOTP, InputOTPSlot } from "../../react/src/components/input-otp";

// An InputOTP of three slots whose input is `data-test={id}`, with
// `children` after its slots
function Otp({ id, children, ...props }) {
  return (
    <InputOTP maxLength={3} aria-label="Code" data-test={id} {...props}>
      {[0, 1, 2].map((index) => (
        <InputOTPSlot key={index} index={index} data-otp-slot={index} />
      ))}
      {children}
    </InputOTP>
  );
}

const invalidInput = <Input invalid aria-label="Name" />;
const disabledButton = <Button disabled>Verify</Button>;

function Page() {
  return (
    <main style={{ display: "grid", gap: 24, padding: 24, width: 640 }}>
      <Otp id="valid" />
      <Otp id="valid-filled" value="12" />
      <Otp id="invalid" invalid />
      <Otp id="invalid-filled" invalid value="12" />
      <Otp id="aria-invalid" aria-invalid />
      <Otp id="invalid-aria-invalid-false" invalid aria-invalid={false} />
      <Otp id="invalid-container-group" invalid containerClassName="group" />
      <Otp id="disabled" disabled />
      <Otp id="disabled-invalid" disabled invalid />

      <fieldset disabled>
        <Otp id="fieldset-disabled" />
      </fieldset>
      <fieldset disabled className="group">
        <Otp id="fieldset-disabled-group" />
      </fieldset>
      <fieldset disabled className="group">
        <Otp id="fieldset-disabled-group-beside-invalid" />
        {invalidInput}
      </fieldset>
      <fieldset disabled className="group">
        <legend>
          <Otp id="fieldset-disabled-group-legend" />
        </legend>
        <input aria-label="Name" />
      </fieldset>

      <div className="group">
        <Otp id="group-beside-invalid-input" />
        {invalidInput}
      </div>
      <div className="group">
        <Otp id="group-beside-disabled-button" />
        {disabledButton}
      </div>
      <div className="group">
        <Otp id="group-beside-select" />
        <select aria-label="Method" defaultValue="">
          <option value="" disabled>
            Choose a method
          </option>
          <option value="sms">SMS</option>
        </select>
      </div>
      <Accordion type="single" defaultValue="open">
        <AccordionItem value="open">
          <AccordionTrigger>Verify your phone</AccordionTrigger>
          <AccordionContent>
            <Otp id="accordion-beside-invalid-input" />
            {invalidInput}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="group/input-otp">
        <Otp id="named-group-beside-invalid-input" />
        {invalidInput}
      </div>
      <div className="group/input-otp">
        <Otp id="named-group-beside-disabled-button" />
        {disabledButton}
      </div>

      <Otp id="child-disabled-button">
        <Button disabled>Resend</Button>
      </Otp>
      <Otp id="child-invalid-input">{invalidInput}</Otp>
      <Otp id="child-invalid-otp">
        <Otp id="child-invalid-otp-inner" invalid />
      </Otp>
      <Otp id="child-disabled-otp">
        <Otp id="child-disabled-otp-inner" disabled />
      </Otp>

      <div className="group">
        <Otp id="pair-invalid" invalid />
        <Otp id="pair-disabled" disabled />
      </div>
      <div className="group/input-otp">
        <Otp id="named-pair-invalid" invalid />
        <Otp id="named-pair-disabled" disabled />
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<Page />);
