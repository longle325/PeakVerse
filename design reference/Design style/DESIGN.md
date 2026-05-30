---
name: Modern Literary
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbd9d9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#eae8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#43474d'
  inverse-surface: '#303030'
  inverse-on-surface: '#f2f0f0'
  outline: '#73777e'
  outline-variant: '#c3c6ce'
  surface-tint: '#46607d'
  primary: '#00162a'
  on-primary: '#ffffff'
  primary-container: '#0d2b45'
  on-primary-container: '#7893b2'
  inverse-primary: '#aec9ea'
  secondary: '#605e57'
  on-secondary: '#ffffff'
  secondary-container: '#e6e2d8'
  on-secondary-container: '#66645d'
  tertiary: '#340002'
  on-tertiary: '#ffffff'
  tertiary-container: '#5b0005'
  on-tertiary-container: '#fb584f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d0e4ff'
  primary-fixed-dim: '#aec9ea'
  on-primary-fixed: '#001d35'
  on-primary-fixed-variant: '#2e4964'
  secondary-fixed: '#e6e2d8'
  secondary-fixed-dim: '#cac6bd'
  on-secondary-fixed: '#1c1c16'
  on-secondary-fixed-variant: '#484740'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb4ac'
  on-tertiary-fixed: '#410003'
  on-tertiary-fixed-variant: '#92030f'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  headline-xl:
    fontFamily: Noto Serif
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  margin-page: 24px
  gutter: 16px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is anchored in the "Modern Literary" aesthetic, bridging the gap between a high-end digital discovery tool and the tactile heritage of Vietnamese literature. The brand personality is intellectual, curated, and serene, targeting readers who value depth and cultural connection over fast-paced social scrolling.

The visual style is a blend of **Minimalism** and **Tactile/Skeuomorphism**. It prioritizes generous whitespace and structured layouts typical of modern editorial design, while utilizing subtle textures and depth to mimic the physical properties of heavy-stock paper and ink. The goal is to evoke the focused, quiet atmosphere of a private library or a contemporary bookstore.

## Colors

The palette is rooted in the "Ink and Parchment" concept. The primary color is a **Deep Ink Blue**, used for core branding, primary typography, and structural elements. The background is a warm **Parchment Cream**, providing a soft, low-strain reading experience that mimics aged paper.

**Cinnabar Red** serves as the call-to-action color, inspired by traditional lacquerware and editorial stamps. **Jade Green** is used for secondary accents, representing growth, poetry, and nature. Neutral tones are kept warm to maintain the organic feel of the design system, avoiding clinical grays in favor of "Dusty Charcoal" and "Paper Shadow."

## Typography

This design system employs a classic serif/sans-serif pairing to balance tradition with modern utility. 

**Noto Serif** is used for all headlines and quotes to evoke the feeling of printed manuscripts. It brings a sense of authority and timelessness to the literature discovery process. 

**Be Vietnam Pro** is utilized for body copy and interface labels. Its contemporary Vietnamese-centric design ensures perfect legibility for tonal marks while maintaining an approachable, friendly character. Large-form reading should prioritize the Serif for comfort, while interactive elements leverage the Sans-Serif for clarity.

## Layout & Spacing

The layout follows a **Fixed Grid** model for mobile devices to maintain the integrity of "book-like" margins. A standard 4-column grid for mobile and 12-column for tablet/desktop is used, with generous side margins (24px) to create a centered, focused reading column.

Spacing follows an 8px rhythm, but utilizes larger "chapters" of space (48px+) between major content sections to prevent the interface from feeling cluttered. Content blocks should be separated by intentional whitespace rather than heavy lines, allowing the eye to rest.

## Elevation & Depth

Elevation is achieved through **Tonal Layers** and **Ambient Shadows**. Surfaces should feel like stacked sheets of high-quality paper. 

Instead of generic drop shadows, use soft, multi-layered shadows with a slight warm tint (#2D1F15 at 5-10% opacity) to mimic the way light hits a physical book. Elements at a higher elevation should have a slightly lighter background color than the Parchment base to signify they are "closer" to the user. Fine, 1px borders in a slightly darker parchment shade are preferred over heavy shadows for secondary containers.

## Shapes

The shape language of this design system is conservative and precise. A **Soft (0.25rem)** roundedness is used for primary cards and buttons to prevent the interface from feeling overly sharp or aggressive, while maintaining a structured, formal appearance. 

Book covers and "Ex Libris" tags should remain strictly sharp (0px) to mirror physical paper edges. Circular shapes are reserved exclusively for user avatars and specific "Discovery" action buttons to differentiate them from content-based components.

## Components

### Buttons & Inputs
- **Primary Action:** Solid Cinnabar Red with White text. Rectangular with minimal rounding.
- **Secondary Action:** Outlined Ink Blue with 1px stroke.
- **Input Fields:** Bottom-border only or very light parchment-tinted containers. Focus states should transition the border to Jade Green.

### Cards & Chips
- **Discovery Cards:** Utilize the "Parchment" color with a 1px "Ink" border. Imagery should be prominent, resembling book covers.
- **Genre Chips:** Pill-shaped, using low-saturation Jade Green or Ink Blue backgrounds with high-contrast text.

### Literature Specifics
- **The "Reader" View:** A dedicated component that strips away UI chrome, maximizing the Noto Serif typography against the Parchment background.
- **Ex Libris Tags:** Small, decorative labels for "Verified Classics" or "Staff Picks" that use the Cinnabar Red as a vertical ribbon or stamp effect.
- **Progress Scroll:** A thin, elegant Jade Green line at the top of the interface to indicate reading progress.