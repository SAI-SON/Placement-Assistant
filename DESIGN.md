# Placement Assistant Design System

Generated via **Google Stitch MCP** (`projects/7802852562402246984`)

---
name: Placement Assistant AI Platform
version: 1.0.0
theme:
  colorMode: DARK
  font: Plus Jakarta Sans
  monoFont: JetBrains Mono
  roundness: ROUND_EIGHT
---

## Brand & Aesthetic Vision
The brand conveys an aura of elite technological capability, intelligence, and hyper-focused career acceleration. Designed for ambitious professionals, engineers, and students navigating competitive recruiting landscapes, the interface evokes the command center of an advanced AI operative: precise, illuminating, and quietly authoritative.

The aesthetic fuses modern high-density SaaS instrumentation with luminous glassmorphism and subtle HUD (Heads-Up Display) sensibilities:
- **Obsidian & Cosmic Void Ground**: `#0B0F19` and `#0F131D`
- **Electric Violet Accent**: `#8B5CF6` / `#A078FF` (signals synthesis, neural intelligence, deep analysis, and high-priority primary actions)
- **Vibrant Cyan Accent**: `#06B6D4` / `#4CD7F6` (signals telemetry, scanning, skill mapping, and secondary interaction surfaces)
- **Teal / Emerald Success**: `#14B8A6` / `#4FDBC8` (applied to verified metrics, interview readiness signals, and positive delta values)

## Core Color Tokens
```css
/* Dark Theme Base (HSL / HEX) */
--background: 222 47% 7%;          /* #0B0F19 / #0F131D */
--foreground: 220 20% 97%;          /* #F9FAFB */

--card: 224 45% 10%;                /* #111827 / rgba(17, 24, 39, 0.70) */
--card-foreground: 220 20% 97%;

--primary: 262 83% 66%;             /* #8B5CF6 */
--primary-hover: 263 70% 50%;       /* #7C3AED */
--primary-foreground: 0 0% 100%;

--secondary: 189 94% 43%;           /* #06B6D4 */
--secondary-hover: 188 86% 53%;     /* #4CD7F6 */
--secondary-foreground: 222 47% 7%;

--tertiary: 172 75% 40%;            /* #14B8A6 */
--tertiary-foreground: 0 0% 100%;

--muted: 220 18% 18%;               /* #1F2937 */
--muted-foreground: 218 11% 65%;    /* #9CA3AF */

--border: 220 18% 22%;              /* rgba(255, 255, 255, 0.08) / #1F2937 */
--input: 220 18% 14%;
--ring: 262 83% 66%;
```

## Typography
- **Primary Headings & Body**: `Plus Jakarta Sans` / `Inter`
  - Display Hero: `56px` / `800` (Mobile: `36px`)
  - Headline XL: `40px` / `700` (Mobile: `28px`)
  - Headline LG: `28px` / `700`
  - Headline MD: `22px` / `600`
  - Body LG: `16px` / `400`
  - Body MD: `14px` / `400`
- **Technical & Telemetry Monospace**: `JetBrains Mono`
  - Label Tech: `12px` / `500` / tracking `0.04em`
  - Label Data: `11px` / `600` / tracking `0.06em`

## Elevation & Glassmorphism
- **Base Ground**: `#0B0F19` with ambient radial glows (`radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.12), transparent 45%)`)
- **Glassmorphic Paneling (`.glass-panel`)**: `rgba(17, 24, 39, 0.70)` with `backdrop-filter: blur(16px)` and specular border `border: 1px solid rgba(255, 255, 255, 0.08)`
- **Interactive Card (`.glass-card-interactive`)**: `rgba(31, 41, 55, 0.50)` with `backdrop-filter: blur(12px)` and hover glow `border-color: rgba(76, 215, 246, 0.3)`
- **Primary Glow Button (`.primary-glow-btn`)**: `linear-gradient(135deg, #8B5CF6 0%, #6D3BD7 100%)` with electric aura
