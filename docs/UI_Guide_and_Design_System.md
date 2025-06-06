# UI Guide and Design System (v2.1)

This document defines the visual style, component library, and design patterns for the SalesPulse application. Core UI components and styles are described for Phase 1\. Sections related to Voice AI are tagged as **Phase 2**.

---

## 1\. Color Palette

| Token Name | HEX | Usage |
| :---- | :---- | :---- |
| `--color-primary` | `#2563EB` | Buttons, links, primary actions |
| `--color-secondary` | `#10B981` | Success states, highlights |
| `--color-accent` | `#FBBF24` | Warnings, call-to-action accents |
| `--color-background` | `#F3F4F6` | Page background |
| `--color-surface` | `#FFFFFF` | Cards, modals, containers |
| `--color-text-primary` | `#1F2937` | Main body text |
| `--color-text-secondary` | `#4B5563` | Secondary text, labels |
| `--color-border` | `#E5E7EB` | Input borders, separators |

Add these tokens to `tailwind.config.js` under `theme.colors` and reference in components via class names (e.g., `bg-primary`, `text-secondary`).

---

## 2\. Typography

| Element | Font Family | Size | Weight | Line Height |
| :---- | :---- | :---- | :---- | :---- |
| Heading 1 (H1) | `Inter` | 2rem | 700 | 2.5rem |
| Heading 2 (H2) | `Inter` | 1.5rem | 600 | 2rem |
| Heading 3 (H3) | `Inter` | 1.25rem | 600 | 1.75rem |
| Body Large | `Inter` | 1rem | 400 | 1.5rem |
| Body Regular | `Inter` | 0.875rem | 400 | 1.25rem |
| Caption | `Inter` | 0.75rem | 400 | 1rem |

Include `@import 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap';` in the global CSS.

---

## 3\. Spacing & Layout

* **Spacing Scale:** Use Tailwind’s default spacing scale (e.g., `p-4` \= 1rem, `m-2` \= 0.5rem).  
    
* **Grid System:** 12-column grid. Use `grid-cols-12` and responsive spans (e.g., `col-span-6 lg:col-span-4`).  
    
* **Container Widths:**  
    
  * `max-w-screen-sm` for mobile/form pages  
  * `max-w-screen-md` for primary content  
  * `max-w-screen-lg` for dashboard/analytics pages

---

## 4\. Core Components

### 4.1 Buttons

| Variant | Classes | Usage |
| :---- | :---- | :---- |
| Primary | `bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark` | Main call-to-action buttons |
| Secondary | `bg-secondary text-white font-medium py-2 px-4 rounded-lg hover:bg-secondary-dark` | Success/confirmation actions |
| Tertiary | `bg-surface text-primary font-medium py-2 px-4 rounded-lg border border-border hover:bg-background` | Secondary actions |
| Disabled | `bg-gray-300 text-gray-500 font-medium py-2 px-4 rounded-lg cursor-not-allowed` | Disabled state |

* Ensure consistent padding and border-radius across all buttons.

### 4.2 Input Fields & Forms

| Element | Classes | Usage |
| :---- | :---- | :---- |
| Text Input | `w-full border border-border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary` | Single-line inputs |
| Textarea | `w-full border border-border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary h-32` | Multi-line inputs |
| Select | `w-full border border-border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary bg-surface` | Dropdown selections |
| Checkbox | `h-4 w-4 text-primary border border-border rounded focus:ring-primary` | Boolean toggles |
| Radio Button | `h-4 w-4 text-primary border border-border focus:ring-primary` | Exclusive options |

* Use `FormLabel` component for `<label>` elements, styled with `text-text-secondary text-sm mb-1 block`.  
* Group related inputs with `space-y-4` for vertical spacing.

### 4.3 Cards & Containers

| Component | Classes | Usage |
| :---- | :---- | :---- |
| Card | `bg-surface shadow-sm rounded-lg p-4` | Section grouping (e.g., KPI card) |
| Modal Overlay | `fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50` | Dark overlay behind modal |
| Modal Content | `bg-surface rounded-lg p-6 max-w-lg w-full` | Modal dialog wrapper |
| Sidebar | `bg-surface w-64 h-full fixed left-0 top-0 shadow-md` | Application navigation |

* Cards should use consistent shadow: `shadow-sm` with `rounded-lg`.  
* Use `z-40` for fixed elements beneath modals.

### 4.4 Navigation & Layout

* **Sidebar Navigation:** Vertical list of links with icons:  
    
  * Classes: `flex flex-col space-y-2 p-4 bg-surface h-full`  
  * Active link: `bg-primary text-white rounded-md`  
  * Inactive link: `text-text-primary hover:bg-background rounded-md p-2`


* **Top Navbar:**  
    
  * Classes: `flex justify-between items-center p-4 bg-surface shadow-sm`  
  * Include user avatar and dropdown for profile/settings.


* **Responsive Behavior:**  
    
  * On `md:` breakpoints, collapse sidebar to a hamburger menu.  
  * Use `hidden md:flex` and `md:hidden` utilities for toggle visibility.

### 4.5 Tables & Data Grids

| Element | Classes | Usage |
| :---- | :---- | :---- |
| Table | `min-w-full divide-y divide-border` | Base table structure |
| Table Header | `bg-background text-text-secondary text-left text-xs uppercase font-medium px-4 py-2` | Header cells |
| Table Row | `bg-surface hover:bg-background` | Row styling |
| Table Cell | `px-4 py-2 text-text-primary text-sm` | Cell styling |

* Use `overflow-x-auto` on parent container for horizontal scrolling on mobile.  
* For large data sets, integrate with React Table or TanStack Table.

---

## 5\. Dashboards & Analytics

### 5.1 Chart Styles

* **Library:** Recharts (or alternative)  
* **Colors:** Use color tokens for data series (`accent`, `secondary`, `primary`).  
* **Legends:** Positioned at top-right with `text-xs` and `text-text-secondary`.  
* **Tooltips:** Styled with `bg-surface shadow-sm rounded-lg p-2`.

### 5.2 KPI Cards

* **Structure:**  
    
  * Title: `text-sm font-medium text-text-secondary`  
  * Value: `text-2xl font-semibold text-text-primary`  
  * Progress bar: `h-2 rounded-full bg-background` with indicator `bg-primary`


* Use `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4` to lay out multiple KPI cards.

---

## 6\. Phase 2: Voice AI UI Components

*All Voice AI–related UI components should be built only after Phase 1\.*

### 6.1 Voice AI Lobby Screen

* **Persona Cards:**  
    
  * Classes: `bg-surface shadow-sm rounded-lg p-4 hover:shadow-md cursor-pointer`  
  * Include avatar image, name, and short description.


* **Scenario Selector:**  
    
  * Use a `select` with `bg-surface border border-border rounded-md p-2`


* **Cost Preview Banner:**  
    
  * Classes: `bg-accent text-white rounded-md p-2 text-center mb-4`

### 6.2 WebRTC Chat Window

* **Layout:**  
    
  * Left area (3/4 width): Audio waveform \+ mic controls  
  * Right area (1/4 width): Live transcript panel


* **Audio Controls:**  
    
  * Mic Button: `bg-secondary text-white rounded-full p-3 hover:bg-secondary-dark`  
  * End Session: `bg-accent text-white rounded-full p-3 hover:bg-accent-dark`


* **Transcript Panel:**  
    
  * Container: `bg-surface h-full overflow-y-auto p-4 text-text-secondary text-sm`

### 6.3 Session Summary Screen

* **Layout:**  
    
  * Summary card: `bg-surface shadow-sm rounded-lg p-6`  
  * Stats grid: `grid grid-cols-1 md:grid-cols-2 gap-4`


* **Download Button:**  
    
  * `bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark`

---

## 7\. Accessibility & RTL Support

* **Contrast:** Ensure all text has a contrast ratio of at least 4.5:1.  
    
* **Focus States:** Use Tailwind’s `focus:ring-2 focus:ring-offset-2 focus:ring-primary` for keyboard navigation.  
    
* **ARIA Attributes:**  
    
  * Add `aria-label` and `role` where applicable (e.g., `role="dialog"` for modals).


* **RTL:**  
    
  * Use `dir="rtl"` on the `<html>` tag for right-to-left language support.  
  * Ensure components respect `text-left` vs `text-right` based on direction.

---

## 8\. Assets & Icons

* **Icon Library:** Lucide Icons (React) — use SVG components, styled via `text-primary` or `text-text-secondary`.  
* **Logo:** Stored in `/public/logo.svg` and `/public/logo-sm.svg`.  
* **Illustrations:** Save in `/public/illustrations/`, optimized for web (SVG or compressed PNG).

---

## 9\. Component Naming Conventions

* **PascalCase** for React component names (e.g., `GoalCard`, `ActivityList`).  
* **Kebab-case** for file names (e.g., `goal-card.tsx`).  
* **Tailwind Class Order:** `layout` → `box-model` → `typography` → `color` → `state` (e.g., `flex p-4 text-sm text-primary hover:bg-background`).

---

For questions or updates, contact [rob@miodiollc.com](mailto:rob@miodiollc.com).

© 2025 SalesPulse  
