import { useContext } from "react";
import { AccordionContext, AccordionItemContext } from "./AccordionContext";
import type { AccordionContextValue, AccordionItemContextValue } from "./types";

export function useAccordionRoot(): AccordionContextValue {
  const ctx = useContext(AccordionContext);
  if (!ctx) {
    throw new Error(
      "useAccordionRoot must be used within an <Accordion> component"
    );
  }
  return ctx;
}

export function useAccordionItem(): AccordionItemContextValue {
  const ctx = useContext(AccordionItemContext);
  if (!ctx) {
    throw new Error(
      "useAccordionItem must be used within an <AccordionItem> component"
    );
  }
  return ctx;
}
