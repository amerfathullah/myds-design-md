"use client";

import {
  Radio,
  RadioButton,
  RadioHintText,
  RadioItem,
  RadioLabel,
} from "@/components/myds";
import { ComponentProps, useId, useState } from "react";

// Each preview prefixes its ids with one of its own, so the several previews
// on a page never share an id, and each label points at its own radio
export function RadioExample(props: ComponentProps<typeof Radio>) {
  const id = useId();
  return (
    <Radio {...props}>
      <RadioItem>
        <RadioButton value="email" id={`${id}-email`} />
        <div className="grid">
          <RadioLabel htmlFor={`${id}-email`}>Email</RadioLabel>
          <RadioHintText>
            We will send notifications to your registered email address.
          </RadioHintText>
        </div>
      </RadioItem>
      <RadioItem>
        <RadioButton value="phone_call" id={`${id}-phone_call`} />
        <div className="grid">
          <RadioLabel htmlFor={`${id}-phone_call`}>Phone Call</RadioLabel>
          <RadioHintText>
            Our representative will call you on your provided phone number.
          </RadioHintText>
        </div>
      </RadioItem>
      <RadioItem>
        <RadioButton value="text_message" id={`${id}-text_message`} />
        <div className="grid">
          <RadioLabel htmlFor={`${id}-text_message`}>Text Message</RadioLabel>
          <RadioHintText>
            You will receive SMS updates on your mobile phone.
          </RadioHintText>
        </div>
      </RadioItem>
      <RadioItem disabled>
        <RadioButton value="postal_mail" id={`${id}-postal_mail`} />
        <div className="grid">
          <RadioLabel htmlFor={`${id}-postal_mail`}>Postal Mail</RadioLabel>
          <RadioHintText>Not available at the moment.</RadioHintText>
        </div>
      </RadioItem>
      <RadioItem>
        <RadioButton
          value="disable_notifications"
          id={`${id}-disable_notifications`}
        />
        <RadioLabel htmlFor={`${id}-disable_notifications`}>
          Disable Notifications
        </RadioLabel>
      </RadioItem>
    </Radio>
  );
}

export function RadioSimpleExample(props: ComponentProps<typeof Radio>) {
  const id = useId();
  return (
    <Radio {...props}>
      <RadioItem>
        <RadioButton value="email" id={`${id}-email`} />
        <div className="grid">
          <RadioLabel htmlFor={`${id}-email`}>Email</RadioLabel>
          <RadioHintText>
            We will send notifications to your registered email address.
          </RadioHintText>
        </div>
      </RadioItem>
      <RadioItem>
        <RadioButton value="phone_call" id={`${id}-phone_call`} />
        <div className="grid">
          <RadioLabel htmlFor={`${id}-phone_call`}>Phone Call</RadioLabel>
          <RadioHintText>
            Our representative will call you on your provided phone number.
          </RadioHintText>
        </div>
      </RadioItem>
    </Radio>
  );
}
