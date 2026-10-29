import { describe, expect, test } from "vitest";

import { clx } from "./index";

describe("clx resolves conflicting MYDS classes", () => {
  test("a text colour token and a text size are not a conflict", () => {
    expect(clx("text-txt-danger", "text-body-sm")).toBe(
      "text-txt-danger text-body-sm",
    );
    expect(clx("text-body-sm", "text-txt-danger")).toBe(
      "text-body-sm text-txt-danger",
    );
    expect(clx("text-txt-black-900 text-heading-2xs", "text-txt-primary")).toBe(
      "text-heading-2xs text-txt-primary",
    );
  });

  test("the later of two text sizes wins", () => {
    expect(clx("text-body-sm", "text-body-lg")).toBe("text-body-lg");
    expect(clx("text-heading-md", "text-sm")).toBe("text-sm");
  });

  test("the later of two semantic colour tokens wins", () => {
    expect(clx("bg-bg-white", "bg-bg-primary-600")).toBe("bg-bg-primary-600");
    expect(clx("text-txt-black-900", "text-txt-danger")).toBe(
      "text-txt-danger",
    );
    expect(clx("border-otl-gray-200", "border-otl-danger-300")).toBe(
      "border-otl-danger-300",
    );
    expect(clx("ring-fr-primary", "ring-fr-danger")).toBe("ring-fr-danger");
  });

  test("a semantic token replaces a primitive colour", () => {
    expect(clx("bg-primary-600", "bg-bg-white")).toBe("bg-bg-white");
  });

  test("MYDS shadows conflict with each other and with shadow-none", () => {
    expect(clx("shadow-button", "shadow-card")).toBe("shadow-card");
    expect(clx("shadow-context-menu", "shadow-none")).toBe("shadow-none");
    expect(clx("shadow-card", "shadow-transparent")).toBe(
      "shadow-card shadow-transparent",
    );
  });

  test("MYDS animations conflict with each other and with animate-none", () => {
    expect(clx("animate-shimmer", "animate-none")).toBe("animate-none");
    expect(clx("animate-slide-up", "animate-slide-down")).toBe(
      "animate-slide-down",
    );
  });

  test("font families, radii and spacing steps resolve", () => {
    expect(clx("font-body", "font-heading font-medium")).toBe(
      "font-heading font-medium",
    );
    expect(clx("rounded-md", "rounded-full")).toBe("rounded-full");
    expect(clx("px-4.5", "px-6")).toBe("px-6");
    expect(clx("origin-tooltip-origin", "origin-top")).toBe("origin-top");
  });
});
