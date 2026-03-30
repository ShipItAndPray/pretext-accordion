import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @chenglou/pretext before importing the hook
vi.mock("@chenglou/pretext", () => ({
  prepare: vi.fn((_text: string, _font: string) => ({ __prepared: true })),
  layout: vi.fn(
    (_prepared: unknown, _maxWidth: number, _lineHeight: number) => ({
      lineCount: 3,
      height: 72,
    })
  ),
}));

import { renderHook } from "@testing-library/react";
import { useAccordionHeight } from "../src/useAccordionHeight";
import { prepare, layout } from "@chenglou/pretext";

describe("useAccordionHeight", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns zero height when container width is 0", () => {
    const { result } = renderHook(() =>
      useAccordionHeight("Hello world", { containerWidth: 0 })
    );

    expect(result.current.height).toBe(0);
    expect(result.current.confidence).toBe(0);
    expect(prepare).not.toHaveBeenCalled();
  });

  it("returns zero height for empty text", () => {
    const { result } = renderHook(() =>
      useAccordionHeight("   ", { containerWidth: 400 })
    );

    expect(result.current.height).toBe(0);
    expect(result.current.confidence).toBe(0);
  });

  it("calls prepare and layout with correct arguments", () => {
    const { result } = renderHook(() =>
      useAccordionHeight("Hello world", {
        containerWidth: 400,
        font: "16px Inter",
        lineHeight: 24,
        padding: { top: 16, bottom: 16, left: 16, right: 16 },
      })
    );

    expect(prepare).toHaveBeenCalledWith("Hello world", "16px Inter");
    // Available width = 400 - 16 - 16 = 368
    expect(layout).toHaveBeenCalledWith(
      { __prepared: true },
      368,
      24
    );

    // 3 lines * 24px + 16px top + 16px bottom = 104
    expect(result.current.height).toBe(104);
    expect(result.current.confidence).toBe(0.95);
  });

  it("uses default font and lineHeight when not provided", () => {
    renderHook(() =>
      useAccordionHeight("Test text", { containerWidth: 600 })
    );

    expect(prepare).toHaveBeenCalledWith(
      "Test text",
      "16px Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    );
    // Default lineHeight = 24, default padding = 16 each side
    // Available width = 600 - 16 - 16 = 568
    expect(layout).toHaveBeenCalledWith(
      { __prepared: true },
      568,
      24
    );
  });

  it("respects maxLines option", () => {
    // Layout mock returns 3 lines, but maxLines is 2
    const { result } = renderHook(() =>
      useAccordionHeight("Long content", {
        containerWidth: 400,
        lineHeight: 24,
        padding: { top: 16, bottom: 16, left: 16, right: 16 },
        maxLines: 2,
      })
    );

    // 2 lines * 24px + 16px top + 16px bottom = 80
    expect(result.current.height).toBe(80);
  });

  it("gives lower confidence for ReactNode content", () => {
    // Pass a non-string (number coerced to ReactNode)
    const { result } = renderHook(() =>
      useAccordionHeight(42 as unknown as string, {
        containerWidth: 400,
      })
    );

    // Numbers get converted to string "42" by extractText
    // But since the original content is not typeof string, confidence should be 0.85
    // Actually 42 is a number, typeof content !== "string" => 0.85
    expect(result.current.confidence).toBe(0.85);
  });

  it("returns measuredAt timestamp", () => {
    const before = Date.now();
    const { result } = renderHook(() =>
      useAccordionHeight("Test", { containerWidth: 400 })
    );
    const after = Date.now();

    expect(result.current.measuredAt).toBeGreaterThanOrEqual(before);
    expect(result.current.measuredAt).toBeLessThanOrEqual(after);
  });

  it("handles prepare/layout throwing an error", () => {
    vi.mocked(prepare).mockImplementationOnce(() => {
      throw new Error("Canvas not available");
    });

    const { result } = renderHook(() =>
      useAccordionHeight("Test", { containerWidth: 400 })
    );

    expect(result.current.height).toBe(0);
    expect(result.current.confidence).toBe(0);
  });
});
