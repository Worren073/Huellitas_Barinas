---
name: Huellitas Barinas Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#ccdbf4'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d4e4fc'
  on-surface: '#0d1c2e'
  on-surface-variant: '#3c4947'
  inverse-surface: '#223144'
  inverse-on-surface: '#eaf1ff'
  outline: '#6c7a77'
  outline-variant: '#bbc9c7'
  surface-tint: '#006a63'
  primary: '#006a63'
  on-primary: '#ffffff'
  primary-container: '#4fd1c5'
  on-primary-container: '#005750'
  inverse-primary: '#5adace'
  secondary: '#8c4c4d'
  on-secondary: '#ffffff'
  secondary-container: '#fdacac'
  on-secondary-container: '#793d3e'
  tertiary: '#6b5f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#d3bf40'
  on-tertiary-container: '#584d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#79f7ea'
  primary-fixed-dim: '#5adace'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#00504a'
  secondary-fixed: '#ffdad9'
  secondary-fixed-dim: '#ffb3b3'
  on-secondary-fixed: '#390b0e'
  on-secondary-fixed-variant: '#703537'
  tertiary-fixed: '#fae361'
  tertiary-fixed-dim: '#dcc748'
  on-tertiary-fixed: '#201c00'
  on-tertiary-fixed-variant: '#514700'
  background: '#f8f9ff'
  on-background: '#0d1c2e'
  surface-variant: '#d4e4fc'
  surface-off-white: '#F7FAFC'
  surface-gray: '#EDF2F7'
  status-pending: '#FEFCBF'
  status-review: '#E6FFFA'
  status-approved: '#C6F6D5'
  status-rejected: '#FED7D7'
  status-completed: '#BEE3F8'
  status-cancelled: '#E2E8F0'
typography:
  headline-xl:
    fontFamily: Montserrat
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 1.5rem
  margin-mobile: 1rem
  margin-desktop: 2rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
---

## Brand & Style

The design system for this pet adoption management platform is built on the pillars of **compassion, organization, and community**. It balances the emotional weight of animal rescue with the functional precision required for operational management.

The visual style is **Corporate / Modern** with a **Tactile** warmth. It utilizes generous white space and soft, high-quality typography to ensure the interface feels approachable and professional. The aesthetic avoids the sterility of pure medical software, instead opting for a "soft-functional" approach that fosters trust between adoption centers and potential pet parents.

**Design Principles:**
- **Clarity over Clutter:** Information-dense management views are simplified through clear grouping.
- **Trust via Transparency:** Statuses and histories are always visible and distinct.
- **Human-Centric:** Visual metaphors should feel gentle (rounded corners, soft shadows) rather than industrial.

## Colors

The palette is anchored by a friendly **Soft Teal (#4FD1C5)** as the primary brand color, chosen for its association with health and tranquility. The **Sandy Beige / Soft Orange (#FFADAD)** serves as a secondary accent to provide warmth and visual interest in call-to-action areas.

**Color Usage:**
- **Primary:** Used for primary actions, active navigation states, and brand-defining accents.
- **Secondary:** Reserved for highlighted information, "heart" or "favorite" interactions, and secondary CTA buttons.
- **Neutral:** A slate-gray scale ensures that text remains legible while backgrounds use high-value, low-saturation grays to maintain a "clean" atmosphere.
- **Status Colors:** Specific tints are mapped to the adoption lifecycle (e.g., green for approved, soft red for rejected) to provide immediate cognitive recognition of process states.

## Typography

This design system uses a two-font pairing to distinguish between brand presence and functional utility.

**Montserrat** is used for headlines to provide a bold, geometric, and modern character. It should be used sparingly for structural titles to maintain visual impact.

**Inter** is the workhorse for all body copy, forms, and data tables. Its high x-height and neutral character ensure maximum readability for management tasks and pet descriptions.

**Scaling:** On mobile devices, headline sizes should scale down using the `-mobile` tokens to prevent text wrapping issues and maintain a balanced information density.

## Layout & Spacing

The system utilizes a **Fluid Grid** model with a 12-column structure for desktop and a 4-column structure for mobile. 

**Grid Rhythm:**
- **Desktop:** 12 columns | 24px (1.5rem) gutters | 32px (2rem) outer margins.
- **Mobile:** 4 columns | 16px (1rem) gutters | 16px (1rem) outer margins.

**Spacing Logic:**
Spacing follows an 8px base unit. Use `stack-` tokens for vertical rhythm between elements. Use `gutter` for horizontal separation between grid items. Containers for the adoption catalog should use a flexible "auto-fit" grid to accommodate various screen sizes gracefully.

## Elevation & Depth

To maintain a clean and modern look, the system uses **Ambient Shadows** and **Tonal Layers** rather than heavy borders.

- **Level 0 (Base):** Off-white background (#F7FAFC). Used for the main canvas.
- **Level 1 (Cards):** Pure white (#FFFFFF) with a very soft, diffused shadow (Blur: 10px, Y: 4px, Color: rgba(0,0,0, 0.04)). Used for pet cards and dashboard widgets.
- **Level 2 (Dropdowns/Modals):** Pure white with a medium shadow (Blur: 20px, Y: 10px, Color: rgba(0,0,0, 0.08)). Used for elements that temporarily overlay the interface.
- **Tonal Tiering:** Use Very Light Gray (#EDF2F7) to differentiate sections within a page (e.g., a sidebar or a header) without adding unnecessary shadows.

## Shapes

The shape language is **Rounded**, reflecting the friendly and compassionate brand personality. 

- **Base Radius (0.5rem):** Standard for buttons, input fields, and small cards.
- **Large Radius (1rem):** Used for pet profile images and primary container cards.
- **Pill (999px):** Exclusively used for status badges (e.g., "Pending", "Approved") and "Add" buttons to make them feel distinct and touch-friendly.

## Components

### Buttons
- **Primary:** Solid Teal (#4FD1C5) with white text. 0.5rem roundedness. Soft shadow on hover.
- **Secondary:** Solid Sandy Beige (#FFADAD) with white text. Used for "Favorite" or "Adopt" actions.
- **Ghost:** Teal outline with transparent background for tertiary actions.

### Cards (Pet & Center)
- White background, 1rem roundedness, Level 1 elevation.
- Pet cards should feature a prominent WebP image with a slight zoom effect on hover.
- Vital stats (age, species, gender) should be displayed as small chips within the card footer.

### Status Badges
- **Shape:** Pill-shaped.
- **Pending:** Pale Yellow background with dark gold text.
- **Under Review:** Pale Teal background with deep teal text.
- **Approved:** Pale Green background with dark green text.
- **Rejected/Cancelled:** Pale Red background with dark red text.

### Form Inputs
- 0.5rem roundedness.
- 1px border (#E2E8F0).
- On focus: Border changes to Teal (#4FD1C5) with a 3px soft outer glow.
- Labels use `label-md` for high clarity.

### Adoption Timeline
- A vertical list component using small circles and connecting lines.
- Active states use the Primary Teal color, while past/inactive states use Neutral Gray.