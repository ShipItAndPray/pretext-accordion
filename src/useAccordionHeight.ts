import { prepare, layout } from "@chenglou/pretext";
import { useMemo } from "react";
import type { HeightPrediction, UseAccordionHeightOptions } from "./types";
import type { ReactNode } from "react";

const DEFAULT_FONT = "16px Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif";
const DEFAULT_LINE_HEIGHT = 24;
const DEFAULT_PADDING = { top: 16, bottom: 16, left: 16, right: 16 };

/**
 * Extract plain text from React children tree.
 * Handles strings, numbers, arrays, and fragments.
 */
function extractText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && "props" in node) {
    return extractText((node as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

/**
 * Predicts the expanded height of accordion content using @chenglou/pretext.
 *
 * Uses canvas-based text measurement (via prepare + layout) instead of DOM
 * measurement. This means the height is known BEFORE the content renders,
 * enabling smooth CSS transitions with zero Cumulative Layout Shift.
 */
export function useAccordionHeight(
  content: string | ReactNode,
  options?: UseAccordionHeightOptions
): HeightPrediction {
  const text = typeof content === "string" ? content : extractText(content);
  const font = options?.font ?? DEFAULT_FONT;
  const lineHeight = options?.lineHeight ?? DEFAULT_LINE_HEIGHT;
  const padding = options?.padding ?? DEFAULT_PADDING;
  const containerWidth = options?.containerWidth ?? 0;
  const maxLines = options?.maxLines;

  return useMemo(() => {
    if (containerWidth <= 0 || !text.trim()) {
      return { height: 0, confidence: 0, measuredAt: Date.now() };
    }

    const availableWidth =
      containerWidth - padding.left - padding.right;

    if (availableWidth <= 0) {
      return { height: 0, confidence: 0, measuredAt: Date.now() };
    }

    try {
      const prepared = prepare(text, font);
      const result = layout(prepared, availableWidth, lineHeight);

      let lines = result.lineCount;
      if (maxLines !== undefined && lines > maxLines) {
        lines = maxLines;
      }

      const predictedHeight =
        lines * lineHeight + padding.top + padding.bottom;

      // Confidence is high for pure text content. If the original content
      // was ReactNode (not string), we lower confidence since there may
      // be non-text elements like images that we cannot measure.
      const confidence = typeof content === "string" ? 0.95 : 0.85;

      return {
        height: predictedHeight,
        confidence,
        measuredAt: Date.now(),
      };
    } catch {
      // If pretext measurement fails (e.g., SSR without canvas),
      // return zero height with low confidence to trigger fallback.
      return { height: 0, confidence: 0, measuredAt: Date.now() };
    }
  }, [text, font, lineHeight, containerWidth, padding.top, padding.bottom, padding.left, padding.right, maxLines, content]);
}
