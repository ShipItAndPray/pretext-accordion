import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAccordionRoot, useAccordionItem } from "./useAccordionContext";
import { useAccordionHeight } from "./useAccordionHeight";
import type { AccordionContentProps } from "./types";

type TransitionPhase = "idle" | "measuring" | "animating" | "open";

export const AccordionContent: React.FC<AccordionContentProps> = ({
  className,
  children,
  forceMount = false,
  transitionDuration = 300,
}) => {
  const { containerWidth } = useAccordionRoot();
  const { isOpen, isDisabled: _isDisabled, triggerId, contentId } =
    useAccordionItem();

  const contentRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<TransitionPhase>(
    isOpen ? "open" : "idle"
  );
  const [fallbackHeight, setFallbackHeight] = useState<number | null>(null);

  // Predict height via pretext
  const prediction = useAccordionHeight(children, {
    containerWidth,
  });

  // Determine which height to use
  const targetHeight =
    prediction.confidence >= 0.8 && prediction.height > 0
      ? prediction.height
      : fallbackHeight;

  // Fallback: measure scrollHeight once if pretext prediction is low confidence
  const measureFallback = useCallback(() => {
    const el = contentRef.current;
    if (el && fallbackHeight === null) {
      // Temporarily make content visible to measure
      const inner = el.querySelector(".pretext-accordion-content-inner");
      if (inner) {
        setFallbackHeight(inner.scrollHeight);
      }
    }
  }, [fallbackHeight]);

  // Handle open/close transitions
  useEffect(() => {
    if (isOpen) {
      if (prediction.confidence < 0.8 && fallbackHeight === null) {
        measureFallback();
      }
      setPhase("animating");
      const timer = setTimeout(() => {
        setPhase("open");
      }, transitionDuration);
      return () => clearTimeout(timer);
    } else {
      if (phase === "open") {
        // Closing: go from auto to specific height, then animate to 0
        setPhase("animating");
        const timer = setTimeout(() => {
          setPhase("idle");
        }, transitionDuration);
        return () => clearTimeout(timer);
      }
      setPhase("idle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, transitionDuration]);

  const shouldRender = forceMount || isOpen || phase !== "idle";

  if (!shouldRender) return null;

  // Determine height style
  let heightStyle: string | number;
  if (phase === "open" && isOpen) {
    heightStyle = "auto";
  } else if (phase === "animating" && isOpen) {
    heightStyle = targetHeight ?? "auto";
  } else if (phase === "animating" && !isOpen) {
    heightStyle = 0;
  } else {
    heightStyle = 0;
  }

  return (
    <div
      ref={contentRef}
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      aria-hidden={!isOpen}
      className={`pretext-accordion-content${className ? ` ${className}` : ""}`}
      data-state={isOpen ? "open" : "closed"}
      style={{
        height: heightStyle,
        overflow: "hidden",
        transition: `height ${transitionDuration}ms ease`,
        ...(targetHeight != null
          ? ({ "--accordion-target-height": `${targetHeight}px` } as React.CSSProperties)
          : {}),
      }}
    >
      <div className="pretext-accordion-content-inner">{children}</div>
    </div>
  );
};
