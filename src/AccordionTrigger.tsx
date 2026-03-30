import React, { useCallback } from "react";
import { useAccordionRoot, useAccordionItem } from "./useAccordionContext";
import type { AccordionTriggerProps } from "./types";

export const AccordionTrigger: React.FC<AccordionTriggerProps> = ({
  className,
  children,
  asChild = false,
}) => {
  const { toggleItem } = useAccordionRoot();
  const { value, isOpen, isDisabled, triggerId, contentId } =
    useAccordionItem();

  const handleClick = useCallback(() => {
    if (!isDisabled) {
      toggleItem(value);
    }
  }, [isDisabled, toggleItem, value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isDisabled) return;

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleItem(value);
      }

      // Arrow key navigation between triggers
      const triggers = (
        e.currentTarget as HTMLElement
      ).closest(".pretext-accordion")?.querySelectorAll<HTMLElement>(
        ".pretext-accordion-trigger:not([data-disabled])"
      );

      if (!triggers) return;
      const current = Array.from(triggers).indexOf(
        e.currentTarget as HTMLElement
      );

      let next = -1;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        next = (current + 1) % triggers.length;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        next = (current - 1 + triggers.length) % triggers.length;
      } else if (e.key === "Home") {
        e.preventDefault();
        next = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        next = triggers.length - 1;
      }

      if (next >= 0) {
        triggers[next].focus();
      }
    },
    [isDisabled, toggleItem, value]
  );

  const props = {
    id: triggerId,
    className: `pretext-accordion-trigger${className ? ` ${className}` : ""}`,
    "aria-expanded": isOpen,
    "aria-controls": contentId,
    "data-state": isOpen ? "open" : "closed",
    "data-disabled": isDisabled || undefined,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(
      children as React.ReactElement<Record<string, unknown>>,
      props
    );
  }

  return (
    <button type="button" {...props}>
      <span className="pretext-accordion-trigger-text">{children}</span>
      <span className="pretext-accordion-chevron" aria-hidden="true">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
};
