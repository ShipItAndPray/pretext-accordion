import type { ReactNode } from "react";

// --- Component Props ---

export interface AccordionProps {
  /** Single or multiple items open at once */
  type?: "single" | "multiple";
  /** Initially open item(s) */
  defaultValue?: string | string[];
  /** Controlled open state */
  value?: string | string[];
  /** Callback when open state changes */
  onValueChange?: (value: string | string[]) => void;
  /** Allow closing all items in single mode */
  collapsible?: boolean;
  className?: string;
  children: ReactNode;
}

export interface AccordionItemProps {
  /** Unique identifier for this item */
  value: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

export interface AccordionTriggerProps {
  className?: string;
  children: ReactNode;
  /** Render as child element instead of button */
  asChild?: boolean;
}

export interface AccordionContentProps {
  className?: string;
  children: ReactNode;
  /** Keep in DOM when closed */
  forceMount?: boolean;
  /** Override default 300ms transition duration */
  transitionDuration?: number;
}

// --- Hook Types ---

export interface HeightPrediction {
  /** Predicted pixel height */
  height: number;
  /** 0-1 confidence score */
  confidence: number;
  /** Timestamp of measurement */
  measuredAt: number;
}

export interface UseAccordionHeightOptions {
  /** Override auto-detected container width */
  containerWidth?: number;
  /** CSS font shorthand, e.g. '16px Inter' */
  font?: string;
  /** Padding around the content */
  padding?: { top: number; bottom: number; left: number; right: number };
  /** Line height in pixels */
  lineHeight?: number;
  /** Max lines to display */
  maxLines?: number;
}

// --- Context Types ---

export interface AccordionContextValue {
  type: "single" | "multiple";
  openItems: string[];
  toggleItem: (value: string) => void;
  registerWidth: (width: number) => void;
  containerWidth: number;
}

export interface AccordionItemContextValue {
  value: string;
  isOpen: boolean;
  isDisabled: boolean;
  triggerId: string;
  contentId: string;
}
