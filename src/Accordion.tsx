import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AccordionContext } from "./AccordionContext";
import type { AccordionProps } from "./types";

function normalizeValue(
  val: string | string[] | undefined,
  type: "single" | "multiple"
): string[] {
  if (val === undefined) return [];
  if (typeof val === "string") return [val];
  if (type === "single" && val.length > 1) return [val[0]];
  return val;
}

export const Accordion: React.FC<AccordionProps> = ({
  type = "single",
  defaultValue,
  value: controlledValue,
  onValueChange,
  collapsible = false,
  className,
  children,
}) => {
  const isControlled = controlledValue !== undefined;
  const [internalOpen, setInternalOpen] = useState<string[]>(() =>
    normalizeValue(defaultValue, type)
  );
  const [containerWidth, setContainerWidth] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const openItems = isControlled
    ? normalizeValue(controlledValue, type)
    : internalOpen;

  // Measure container width with ResizeObserver
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setContainerWidth(width);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggleItem = useCallback(
    (itemValue: string) => {
      const update = (prev: string[]): string[] => {
        const isOpen = prev.includes(itemValue);

        if (type === "single") {
          if (isOpen) {
            return collapsible ? [] : prev;
          }
          return [itemValue];
        }

        // multiple mode
        if (isOpen) {
          return prev.filter((v) => v !== itemValue);
        }
        return [...prev, itemValue];
      };

      if (isControlled) {
        const next = update(openItems);
        if (type === "single") {
          onValueChange?.(next[0] ?? "");
        } else {
          onValueChange?.(next);
        }
      } else {
        setInternalOpen((prev) => {
          const next = update(prev);
          if (type === "single") {
            onValueChange?.(next[0] ?? "");
          } else {
            onValueChange?.(next);
          }
          return next;
        });
      }
    },
    [type, collapsible, isControlled, openItems, onValueChange]
  );

  const registerWidth = useCallback((width: number) => {
    setContainerWidth(width);
  }, []);

  const ctxValue = useMemo(
    () => ({
      type,
      openItems,
      toggleItem,
      registerWidth,
      containerWidth,
    }),
    [type, openItems, toggleItem, registerWidth, containerWidth]
  );

  return (
    <AccordionContext.Provider value={ctxValue}>
      <div
        ref={rootRef}
        className={`pretext-accordion${className ? ` ${className}` : ""}`}
        data-orientation="vertical"
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
};
