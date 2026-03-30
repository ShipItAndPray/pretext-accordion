import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock @chenglou/pretext
vi.mock("@chenglou/pretext", () => ({
  prepare: vi.fn(() => ({ __prepared: true })),
  layout: vi.fn(() => ({ lineCount: 2, height: 48 })),
}));

// Mock ResizeObserver
class MockResizeObserver {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe(target: Element) {
    // Fire immediately with a width
    this.callback(
      [
        {
          target,
          contentRect: { width: 600, height: 0 } as DOMRectReadOnly,
          borderBoxSize: [],
          contentBoxSize: [],
          devicePixelContentBoxSize: [],
        },
      ],
      this
    );
  }
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", MockResizeObserver);
});

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../src/index";

function TestAccordion({
  type = "single" as const,
  collapsible = false,
  onValueChange,
}: {
  type?: "single" | "multiple";
  collapsible?: boolean;
  onValueChange?: (v: string | string[]) => void;
}) {
  return (
    <Accordion type={type} collapsible={collapsible} onValueChange={onValueChange}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Item 1</AccordionTrigger>
        <AccordionContent>Content 1</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Item 2</AccordionTrigger>
        <AccordionContent>Content 2</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3" disabled>
        <AccordionTrigger>Item 3</AccordionTrigger>
        <AccordionContent>Content 3</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

describe("Accordion", () => {
  it("renders all items with correct ARIA attributes", () => {
    render(<TestAccordion />);

    const triggers = screen.getAllByRole("button");
    expect(triggers).toHaveLength(3);

    // All triggers start collapsed
    triggers.forEach((trigger) => {
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });
  });

  it("opens an item on click", () => {
    render(<TestAccordion />);

    const trigger1 = screen.getByText("Item 1");
    fireEvent.click(trigger1);

    expect(
      trigger1.closest("button")
    ).toHaveAttribute("aria-expanded", "true");

    // Content should be rendered
    expect(screen.getByText("Content 1")).toBeInTheDocument();
  });

  it("single mode: closes previous item when opening another", () => {
    render(<TestAccordion />);

    const trigger1 = screen.getByText("Item 1");
    const trigger2 = screen.getByText("Item 2");

    fireEvent.click(trigger1);
    expect(
      trigger1.closest("button")
    ).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(trigger2);
    expect(
      trigger1.closest("button")
    ).toHaveAttribute("aria-expanded", "false");
    expect(
      trigger2.closest("button")
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("single mode without collapsible: cannot close last open item", () => {
    render(<TestAccordion />);

    const trigger1 = screen.getByText("Item 1");
    fireEvent.click(trigger1); // open
    fireEvent.click(trigger1); // try to close

    // Should still be open
    expect(
      trigger1.closest("button")
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("single mode with collapsible: can close the open item", () => {
    render(<TestAccordion collapsible />);

    const trigger1 = screen.getByText("Item 1");
    fireEvent.click(trigger1); // open
    expect(
      trigger1.closest("button")
    ).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(trigger1); // close
    expect(
      trigger1.closest("button")
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("multiple mode: allows concurrent open items", () => {
    render(<TestAccordion type="multiple" />);

    const trigger1 = screen.getByText("Item 1");
    const trigger2 = screen.getByText("Item 2");

    fireEvent.click(trigger1);
    fireEvent.click(trigger2);

    expect(
      trigger1.closest("button")
    ).toHaveAttribute("aria-expanded", "true");
    expect(
      trigger2.closest("button")
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("multiple mode: can close individual items", () => {
    render(<TestAccordion type="multiple" />);

    const trigger1 = screen.getByText("Item 1");
    const trigger2 = screen.getByText("Item 2");

    fireEvent.click(trigger1);
    fireEvent.click(trigger2);
    fireEvent.click(trigger1); // close item 1

    expect(
      trigger1.closest("button")
    ).toHaveAttribute("aria-expanded", "false");
    expect(
      trigger2.closest("button")
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("disabled items cannot be opened", () => {
    render(<TestAccordion />);

    const trigger3 = screen.getByText("Item 3");
    fireEvent.click(trigger3);

    expect(
      trigger3.closest("button")
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("calls onValueChange when items are toggled", () => {
    const onChange = vi.fn();
    render(<TestAccordion onValueChange={onChange} />);

    const trigger1 = screen.getByText("Item 1");
    fireEvent.click(trigger1);

    expect(onChange).toHaveBeenCalledWith("item-1");
  });

  it("keyboard: Enter toggles item", () => {
    render(<TestAccordion collapsible />);

    const trigger1 = screen.getByText("Item 1").closest("button")!;
    fireEvent.keyDown(trigger1, { key: "Enter" });

    expect(trigger1).toHaveAttribute("aria-expanded", "true");
  });

  it("keyboard: Space toggles item", () => {
    render(<TestAccordion collapsible />);

    const trigger1 = screen.getByText("Item 1").closest("button")!;
    fireEvent.keyDown(trigger1, { key: " " });

    expect(trigger1).toHaveAttribute("aria-expanded", "true");
  });

  it("renders with defaultValue", () => {
    render(
      <Accordion defaultValue="item-2">
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Item 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger1 = screen.getByText("Item 1").closest("button")!;
    const trigger2 = screen.getByText("Item 2").closest("button")!;

    expect(trigger1).toHaveAttribute("aria-expanded", "false");
    expect(trigger2).toHaveAttribute("aria-expanded", "true");
  });

  it("content has proper region role and aria-labelledby", () => {
    render(
      <Accordion defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const region = screen.getByRole("region");
    expect(region).toHaveAttribute(
      "aria-labelledby",
      "pretext-accordion-trigger-item-1"
    );
    expect(region).toHaveAttribute(
      "id",
      "pretext-accordion-content-item-1"
    );
  });
});
