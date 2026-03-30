# @shipitandpray/pretext-accordion

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://shipitandpray.github.io/pretext-accordion/) [![npm](https://img.shields.io/npm/v/@shipitandpray/pretext-accordion?color=blue)](https://www.npmjs.com/package/@shipitandpray/pretext-accordion)

**Zero-CLS accordion component powered by predictive text measurement.**

[![npm version](https://img.shields.io/npm/v/@shipitandpray/pretext-accordion)](https://www.npmjs.com/package/@shipitandpray/pretext-accordion)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@shipitandpray/pretext-accordion)](https://bundlephobia.com/package/@shipitandpray/pretext-accordion)
[![CLS Score](https://img.shields.io/badge/CLS-0.000-brightgreen)](https://web.dev/cls/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

## Why This Exists

Cumulative Layout Shift (CLS) is a Core Web Vital and a direct Google ranking factor. **62% of mobile pages have CLS issues** (HTTPArchive, 2025). Accordions are one of the worst offenders -- expanding content pushes everything below it down, causing massive layout shifts.

Current solutions either:

1. Use `max-height` hacks with arbitrary large values (wastes GPU, janky animation)
2. Measure after render with `scrollHeight` (causes visible flicker/reflow)
3. Use `auto` height animation (no transition support in most browsers)

**pretext-accordion** solves this by predicting the expanded height of accordion content **before** it renders, using [`@chenglou/pretext`](https://github.com/chenglou/pretext) canvas-based text measurement. This enables smooth CSS transitions from `height: 0` to `height: {predicted}px` with zero layout shift.

## How It Works

```
1. AccordionItem mounts
2. useAccordionHeight extracts text from children
3. @chenglou/pretext measures text width via canvas (no DOM reflow)
4. Predicted height = lineCount * lineHeight + padding
5. CSS transition: height: 0 -> height: {predicted}px
6. After transition: height switches to auto (handles dynamic content)
```

The key insight: `@chenglou/pretext` uses `prepare()` and `layout()` to predict how text will wrap at a given container width -- all computed via an offscreen canvas. No DOM measurement, no layout thrashing, no CLS.

## Install

```bash
npm install @shipitandpray/pretext-accordion @chenglou/pretext react react-dom
```

## Quick Start

```tsx
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@shipitandpray/pretext-accordion";
import "@shipitandpray/pretext-accordion/css";

function FAQ() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="shipping">
        <AccordionTrigger>How long does shipping take?</AccordionTrigger>
        <AccordionContent>
          Standard shipping takes 5-7 business days. Express shipping is
          available for 2-3 business day delivery.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>What is your return policy?</AccordionTrigger>
        <AccordionContent>
          We accept returns within 30 days of purchase. Items must be in
          original condition with tags attached.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
```

## API Reference

### `<Accordion>`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'single' \| 'multiple'` | `'single'` | Allow one or multiple items open |
| `defaultValue` | `string \| string[]` | — | Initially open item(s) |
| `value` | `string \| string[]` | — | Controlled open state |
| `onValueChange` | `(value: string \| string[]) => void` | — | Callback on state change |
| `collapsible` | `boolean` | `false` | Allow closing all items (single mode) |
| `className` | `string` | — | Additional CSS class |

### `<AccordionItem>`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | *required* | Unique identifier |
| `disabled` | `boolean` | `false` | Prevent opening |
| `className` | `string` | — | Additional CSS class |

### `<AccordionTrigger>`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | Additional CSS class |
| `asChild` | `boolean` | `false` | Render as child element |

### `<AccordionContent>`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | Additional CSS class |
| `forceMount` | `boolean` | `false` | Keep in DOM when closed |
| `transitionDuration` | `number` | `300` | Animation duration (ms) |

### `useAccordionHeight(content, options?)`

Standalone hook for predicting content height.

```tsx
const prediction = useAccordionHeight("Your text content", {
  containerWidth: 600,
  font: "16px Inter",
  lineHeight: 24,
  padding: { top: 16, bottom: 16, left: 16, right: 16 },
});
// prediction.height    -> predicted pixel height
// prediction.confidence -> 0-1 confidence score
// prediction.measuredAt -> timestamp
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `containerWidth` | `number` | `0` | Width of container |
| `font` | `string` | `'16px Inter, ...'` | CSS font shorthand |
| `lineHeight` | `number` | `24` | Line height in px |
| `padding` | `{top, bottom, left, right}` | `16px all` | Content padding |
| `maxLines` | `number` | — | Truncate prediction |

## Comparison

| Feature | pretext-accordion | Radix Accordion | Headless UI Disclosure | `<details>` |
|---------|:-:|:-:|:-:|:-:|
| Zero CLS on expand | Yes | No | No | No |
| Smooth height transition | Yes | Yes | Yes | No |
| No DOM measurement | Yes | No | No | N/A |
| SSR safe | Yes | Yes | Yes | Yes |
| WAI-ARIA pattern | Yes | Yes | Yes | Partial |
| Bundle size (gzip) | ~3KB | ~8KB | ~5KB | 0KB |
| Prediction before render | Yes | No | No | No |

## Accessibility

Full WAI-ARIA accordion pattern compliance:

- `role="region"` on content panels
- `aria-labelledby` linking content to its trigger
- `aria-expanded` on trigger buttons
- `aria-controls` linking triggers to content
- Keyboard: Enter/Space to toggle, ArrowUp/ArrowDown between items, Home/End

## Performance

| Metric | Target |
|--------|--------|
| CLS contribution | 0.000 (zero layout shift) |
| Height prediction accuracy | within 2px for text-only content |
| Height prediction time | < 1ms per item |
| Bundle size (gzipped) | < 3KB (excluding pretext) |

## License

MIT
