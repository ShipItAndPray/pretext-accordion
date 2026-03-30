import React, { useMemo } from "react";
import { AccordionItemContext } from "./AccordionContext";
import { useAccordionRoot } from "./useAccordionContext";
import type { AccordionItemProps } from "./types";

export const AccordionItem: React.FC<AccordionItemProps> = ({
  value,
  disabled = false,
  className,
  children,
}) => {
  const { openItems } = useAccordionRoot();
  const isOpen = openItems.includes(value);

  const triggerId = `pretext-accordion-trigger-${value}`;
  const contentId = `pretext-accordion-content-${value}`;

  const ctxValue = useMemo(
    () => ({
      value,
      isOpen,
      isDisabled: disabled,
      triggerId,
      contentId,
    }),
    [value, isOpen, disabled, triggerId, contentId]
  );

  return (
    <AccordionItemContext.Provider value={ctxValue}>
      <div
        className={`pretext-accordion-item${className ? ` ${className}` : ""}`}
        data-state={isOpen ? "open" : "closed"}
        data-disabled={disabled || undefined}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
};
