import { fn } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { createStory } from "../utils";
import { AutoToast } from "@amerfathullah/myds-react/toast";
import { useToast } from "@amerfathullah/myds-react/hooks";
import { Button } from "@amerfathullah/myds-react/button";
import React from "react";

const DemoToast = (props: any) => {
  const { toast } = useToast();

  return (
    <div className="flex h-screen w-full items-center justify-center gap-1">
      <Button
        variant={"default-outline"}
        onClick={() => {
          toast({
            variant: "message",
            title: "Hello, world!",
            description: "this is a description",
          });
        }}
      >
        Message
      </Button>
      <Button
        variant={"default-outline"}
        onClick={() => {
          toast({
            variant: "info",
            title: "Quick info toast",
            description: "this is a description",
          });
        }}
      >
        Info
      </Button>
      <Button
        variant={"default-outline"}
        onClick={() => {
          toast({
            variant: "success",
            title: "Success",
            description: "this is a description",
          });
        }}
      >
        Success
      </Button>
      <Button
        variant={"default-outline"}
        onClick={() => {
          toast({
            variant: "warning",
            title: "Warning",
            description: "this is a description",
          });
        }}
      >
        Warning
      </Button>
      <Button
        variant={"default-outline"}
        onClick={() => {
          toast({
            variant: "error",
            title: "Error",
            description: "this is a description",
          });
        }}
      >
        Error
      </Button>

      <AutoToast {...props} />
    </div>
  );
};

/**
 * ### Overview
 *
 * This file contains the implementation of a Toast component using `@amerfathullah/myds-react/toast`.
 * The `DemoToast` component demonstrates various toast notifications such as message, info, success, warning, and error.
 *
 * > Toast enak dimakan pagi,
 * > Hangat terasa di dalam hati.
 * > Komponen Toast ini serbaguna sekali,
 * > Memberi notifikasi dengan cepat dan rapi. -- ChatGPT
 *
 *
 * ### Usage
 *
 * Publish a toast with `toast()` from `useToast`, and mount `AutoToast` once
 * to show it:
 *
 * ```tsx
 * "use client";
 *
 * import { Button } from "@amerfathullah/myds-react/button";
 * import { useToast } from "@amerfathullah/myds-react/hooks";
 * import { AutoToast } from "@amerfathullah/myds-react/toast";
 *
 * // This demo mounts AutoToast beside its button. An app mounts only one:
 * // if your root layout already has one, as in Simple Usage, leave it out here.
 * export default function ToastDemo() {
 *   const { toast } = useToast();
 *
 *   return (
 *     <>
 *       <Button
 *         onClick={() =>
 *           toast({
 *             variant: "message",
 *             title: "Hello, world!",
 *             description: "this is a description",
 *           })
 *         }
 *       >
 *         Message variant
 *       </Button>
 *       <AutoToast />
 *     </>
 *   );
 * }
 * ```
 *
 * Or, for more control, compose the toaster yourself from the toast's parts,
 * `ToastIcon` and `ToastProgress` among them:
 *
 * ```tsx
 * "use client";
 *
 * import { useEffect } from "react";
 * import { useToast } from "@amerfathullah/myds-react/hooks";
 * import {
 *   ToastClose,
 *   ToastDescription,
 *   ToastIcon,
 *   ToastProgress,
 *   ToastProvider,
 *   ToastRoot,
 *   ToastTitle,
 *   ToastViewport,
 * } from "@amerfathullah/myds-react/toast";
 *
 * // Mount the toaster once in your app, high up the tree, in place of AutoToast
 * export default function Toaster() {
 *   const { toasts, subscribe, unsubscribe } = useToast();
 *
 *   // Show each toast that toast() from useToast publishes
 *   useEffect(() => {
 *     subscribe();
 *     return () => {
 *       unsubscribe();
 *     };
 *   }, []);
 *
 *   return (
 *     <ToastProvider>
 *       {toasts.map((event, index) => (
 *         <ToastRoot
 *           key={index}
 *           variant={event.variant || "message"}
 *           type={event.type}
 *         >
 *           <ToastIcon />
 *           <div className="space-y-1">
 *             <ToastTitle>{event.title}</ToastTitle>
 *             {event.description && (
 *               <ToastDescription>{event.description}</ToastDescription>
 *             )}
 *           </div>
 *           <ToastClose />
 *           <ToastProgress />
 *         </ToastRoot>
 *       ))}
 *
 *       <ToastViewport />
 *     </ToastProvider>
 *   );
 * }
 * ```
 */
const meta = {
  title: "@amerfathullah/myds-react/Toast",
  component: DemoToast,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",

    docs: {
      story: {
        inline: false,
        height: "500px",
      },
    },
  },

  argTypes: {
    duration: {
      table: {
        type: {
          summary: "5000",
        },
      },
      description: "Time (ms) before toast disappears",
      control: { type: "range", min: 1000, max: 10000, step: 1000 },
      type: "number",
    },
  },
} satisfies Meta<typeof AutoToast>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Storybook stories for different variants of a component.
 *
 * @example
 * export const Default: Story = createStory({ ... });
 * export const DarkDefault: Story = createStory({ ... }, "dark");
 */

export const Default: Story = createStory({
  duration: 5000,
});
export const DefaultDark: Story = createStory({ className: "dark" }, "dark");
