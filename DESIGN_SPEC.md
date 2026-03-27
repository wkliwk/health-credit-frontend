# Health Credit -- Full Redesign Spec

**Date:** 2026-03-27
**Direction:** Digital Wallet / Premium Health Pass
**Status:** Ready for implementation

---

## Table of Contents

1. [Audit of Current UI](#1-audit-of-current-ui)
2. [Design Direction](#2-design-direction)
3. [Design System](#3-design-system)
4. [New Custom Components](#4-new-custom-components)
5. [Page-by-Page Redesign](#5-page-by-page-redesign)
6. [Animation Specifications](#6-animation-specifications)
7. [Implementation Priority](#7-implementation-priority)

---

## 1. Audit of Current UI

### Login / Register Pages
- **Problem:** Generic MUI Paper + TextField. No branding, no personality. Looks like a boilerplate tutorial app.
- **Missing:** Logo, brand identity, visual metaphor for "health" or "trust." No encryption/security messaging on these pages. No visual differentiation from any other form on the internet.

### Home Page
- **Problem:** A centered lock icon, a heading, and a single "Get Started" button with no destination. Completely empty -- no dashboard, no card stack, no value proposition. This is a dead-end page for logged-in users.
- **Missing:** The entire product concept. A logged-in user should see their health credential wallet, not a landing page.

### Upload Page
- **Problem:** Functional but generic. The drag-and-drop zone looks like every file upload widget. No visual connection to "this will become a secure health card." The encryption password field feels detached from the upload flow.
- **Missing:** Visual preview of what the uploaded document will become (a card). Progress animation is a generic MUI LinearProgress.

### Documents Page
- **Problem:** A flat MUI List. Documents are rows with tiny chips. No visual hierarchy. No sense that these are important health credentials. Looks like a file manager, not a wallet.
- **Missing:** Card-based layout, document type icons with meaning, status indicators, empty state design.

### Shares Page
- **Problem:** Cards with monospace token strings. The create dialog is a functional but uninspired MUI Dialog. No visual representation of "sharing a credential." Copy-link workflow is buried.
- **Missing:** QR code generation, card-flip reveal animation, visual share status, recipient-facing preview.

### SharedView Page (public)
- **Problem:** Another generic Paper + form. The person receiving a shared health document gets a clinical, cold interface. No trust signals, no branding, no "this is a verified, encrypted credential" feel.
- **Missing:** Trust indicators, verified badge, branded experience, professional appearance that instills confidence in the health data.

### Layout / Navigation
- **Problem:** Standard MUI AppBar with text buttons. Functional but not memorable. No bottom navigation for mobile (critical for a "show your phone" use case). Dark mode toggle is present but the dark mode itself is just default MUI dark -- not premium.
- **Missing:** Bottom navigation bar for mobile, animated transitions between pages, brand-consistent navigation.

### Overall Assessment
The app is a **functional prototype** with zero visual identity. Every element screams "MUI default." For a product that asks users to trust it with sensitive health data, the UI communicates nothing about security, premium quality, or credibility. The CEO's feedback is correct -- this needs to feel like a digital wallet (Apple Wallet, Google Pay) where each document is a card you can flash.

---

## 2. Design Direction

### Concept: "Health Pass Wallet"

The core metaphor is a **digital wallet containing health credential cards**. Users "carry" their health passes and can "show" them by flipping a card to reveal a QR/share code. Think Apple Wallet passes, but for health documents.

### Design Pillars

1. **Dark-mode-first premium** -- Deep dark backgrounds with subtle gradients. Glass morphism on cards. The app should feel like a luxury fintech tool, not a medical form.

2. **Cards as the core unit** -- Every document is a card with a gradient, type icon, and trust badge. Cards stack like a wallet. Interaction is tap-to-expand, swipe-to-dismiss, flip-to-share.

3. **Animation conveys security** -- Lock animations on encrypt, shield pulse on verified, smooth card transitions. Motion design communicates that something meaningful is happening, not just data shuffling.

4. **Mobile-first for sharing** -- The primary use case is standing in front of someone and showing your phone. Bottom nav, large touch targets, one-handed operation, full-screen card view.

5. **Trust through design** -- Encryption badges, shield icons, verified checkmarks, expiry countdowns. Every element reinforces "your data is safe and verified."

---

## 3. Design System

### Color Palette

```
-- Background --
bg-primary:       #0A0E1A        (near-black with blue undertone)
bg-secondary:     #111827        (dark slate)
bg-surface:       #1A1F2E        (elevated surface)
bg-surface-hover: #242B3D        (hover state)

-- Brand --
brand-primary:    #6366F1        (indigo -- trust, technology)
brand-secondary:  #8B5CF6        (violet -- premium)
brand-accent:     #06B6D4        (cyan -- health, clarity)

-- Status --
success:          #10B981        (emerald green)
warning:          #F59E0B        (amber)
error:            #EF4444        (red)
info:             #3B82F6        (blue)

-- Text --
text-primary:     #F1F5F9        (near-white)
text-secondary:   #94A3B8        (muted blue-gray)
text-tertiary:    #64748B        (subtle)

-- Card Gradients (per document type) --
gradient-sti:     linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)
gradient-vaccine: linear-gradient(135deg, #10B981 0%, #06B6D4 100%)
gradient-blood:   linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)
gradient-general: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)
gradient-default: linear-gradient(135deg, #475569 0%, #334155 100%)

-- Glass Morphism --
glass-bg:         rgba(255, 255, 255, 0.05)
glass-border:     rgba(255, 255, 255, 0.10)
glass-blur:       blur(12px)
```

### Typography

```
Font Family:      "Inter" (primary), "SF Pro Display" (iOS fallback), system-ui
                  Import from Google Fonts: Inter 400, 500, 600, 700

-- Scale --
display:          36px / 700 / -0.02em    (page titles, hero text)
h1:               28px / 700 / -0.01em    (section headers)
h2:               22px / 600 / -0.01em    (card titles)
h3:               18px / 600 / 0          (subsections)
body-lg:          16px / 400 / 0          (primary body text)
body:             14px / 400 / 0.01em     (standard body)
caption:          12px / 500 / 0.02em     (labels, badges, chips)
overline:         11px / 600 / 0.08em     (ALL CAPS labels)
```

### Spacing

```
Base unit:        4px
Spacing scale:    4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80
Card padding:     24px
Page margin:      16px (mobile), 24px (tablet), 32px (desktop)
Section gap:      32px
```

### Border Radius

```
xs:               6px     (chips, small badges)
sm:               8px     (buttons, inputs)
md:               12px    (cards, dialogs)
lg:               16px    (large cards, modals)
xl:               24px    (wallet cards)
full:             9999px  (pills, avatars)
```

### Elevation / Shadows

```
No traditional box-shadows. Use:
1. Subtle borders:      1px solid rgba(255,255,255,0.08)
2. Glass morphism:      backdrop-filter: blur(12px); background: rgba(255,255,255,0.05)
3. Glow effects:        0 0 40px rgba(99,102,241,0.15) for focused/active cards
4. Card shadow:         0 8px 32px rgba(0,0,0,0.4) for elevated cards
```

### Breakpoints

```
mobile:           0 - 599px     (single column, bottom nav)
tablet:           600 - 899px   (two-column cards)
desktop:          900+          (max-width container, sidebar potential)
```

### MUI Theme Override (theme.ts)

The MUI theme should be fully overridden with these tokens. Default dark mode should use bg-primary as the default background and bg-surface as paper. Remove light mode entirely -- this app is dark-mode only.

---

## 4. New Custom Components

### 4.1 HealthCard

The core visual unit. Each uploaded document becomes a wallet-style card.

```
Component: <HealthCard />

Props:
  - documentId: string
  - fileName: string
  - documentType: 'sti' | 'vaccine' | 'blood' | 'general'
  - date: string (upload date)
  - expiresAt?: string
  - encrypted: boolean
  - size: 'compact' | 'full'
  - onTap?: () => void
  - onShare?: () => void

Visual spec:
  - Width: 100% of container (max 380px)
  - Height: 220px (compact) / 280px (full)
  - Border radius: 24px
  - Background: gradient based on documentType (see color palette)
  - Padding: 24px
  - Content layout:
    Top-left:     Document type icon (white, 32px) + type label (overline, white/80%)
    Top-right:    TrustBadge (encrypted lock icon, small)
    Center:       File name (h2, white, max 2 lines, ellipsis)
    Bottom-left:  Date (caption, white/60%) + file size
    Bottom-right: Expiry countdown chip (if expiresAt) OR "No Expiry" chip
  - Subtle noise texture overlay (opacity 0.03) for premium feel
  - Inner shadow: inset 0 1px 0 rgba(255,255,255,0.1) (top highlight)

States:
  - Default: as above
  - Hover: slight scale(1.02), glow shadow appears (0 0 40px brand-primary/20%)
  - Pressed: scale(0.98), 100ms
  - Dragging: scale(1.05), shadow intensifies
```

### 4.2 CardStack

Wallet view showing multiple cards stacked with perspective.

```
Component: <CardStack />

Props:
  - cards: HealthCard[]
  - onCardTap: (index: number) => void
  - emptyState?: ReactNode

Visual spec:
  - Cards are stacked with 60px vertical offset between each
  - Top card is fully visible
  - Cards behind peek out with their top gradient edge visible
  - Perspective transform: each subsequent card has:
      translateY(index * 60px)
      scale(1 - index * 0.04)
      opacity(1 - index * 0.15)
  - Maximum 5 visible cards in stack, rest hidden
  - Tapping a background card brings it to front with spring animation

Interaction:
  - Swipe up on top card: reveals next card (300ms spring)
  - Tap on card: expand to full view (shared element transition)
  - Long press: enters reorder mode (cards separate, draggable)
```

### 4.3 ShareReveal

Animation component for creating/showing a share link.

```
Component: <ShareReveal />

Props:
  - shareUrl: string
  - card: HealthCard props (to show the card being shared)
  - onClose: () => void

Visual spec:
  - Full-screen overlay (bg-primary with 80% opacity backdrop)
  - Center: the HealthCard, shown at full size
  - On mount: card performs a 3D Y-axis flip (front = card face, back = QR code)
  - Flip duration: 600ms, ease-out-back
  - Back of card:
      - Same gradient border/frame as front
      - White rounded rectangle (280x280px) containing QR code
      - Below QR: share URL in monospace (truncated)
      - Copy button (pill shape) below URL
      - Expiry countdown timer
  - Below the card: "Share this with someone" caption
  - Tap card again: flips back to front face

QR Code:
  - Use 'qrcode.react' or 'qrcode' library
  - Size: 240x240px
  - White background, brand-primary foreground
  - Error correction level: M
  - Include HC logo in center of QR (24x24px)
```

### 4.4 TrustBadge

Small indicator showing encryption/verification status.

```
Component: <TrustBadge />

Props:
  - variant: 'encrypted' | 'verified' | 'expires' | 'view-limited'
  - label?: string
  - size: 'sm' | 'md'

Visual spec:
  - Pill shape (border-radius: full)
  - Background: glass-bg with glass-border
  - Backdrop-filter: blur(8px)
  - Icon (16px sm / 20px md) + label text (caption)
  - Color per variant:
      encrypted:    brand-primary icon, "Encrypted" label
      verified:     success icon (shield-check), "Verified" label
      expires:      warning icon (clock), dynamic "Xh remaining" label
      view-limited: info icon (eye), "X views left" label
  - Subtle pulse animation on 'verified' variant (every 3s, subtle scale 1.0 -> 1.05 -> 1.0)
```

### 4.5 BottomNav

Mobile bottom navigation bar.

```
Component: <BottomNav />

Visible: only on mobile (< 600px)

Tabs:
  1. Wallet (home icon) -> /
  2. Upload (plus-circle icon) -> /upload
  3. Documents (folder icon) -> /documents
  4. Share (share icon) -> /shares

Visual spec:
  - Fixed bottom, full width
  - Height: 64px + safe-area-inset-bottom
  - Background: bg-secondary with glass-blur backdrop
  - Border-top: 1px solid glass-border
  - Active tab: brand-primary color, icon filled
  - Inactive tab: text-tertiary, icon outlined
  - Active indicator: small pill (24px wide, 3px tall) above icon, brand-primary, animated slide
  - Touch target: each tab is minimum 48px wide and 48px tall
```

### 4.6 EncryptionProgress

Animated encryption/upload progress indicator.

```
Component: <EncryptionProgress />

Props:
  - stage: 'encrypting' | 'uploading' | 'complete'
  - fileName: string
  - progress: number (0-100)

Visual spec:
  - Circular progress ring (80px diameter) with brand-primary gradient stroke
  - Center: animated lock icon
    - 'encrypting': lock shackle animates closing (rotation keyframes)
    - 'uploading': subtle pulse
    - 'complete': morphs to checkmark (300ms)
  - Below ring: stage label (body text)
  - Below label: file name (caption, text-secondary)
  - Progress ring uses conic-gradient for smooth fill
```

---

## 5. Page-by-Page Redesign

### 5.1 Login Page

**Layout:**
- Full viewport height, centered vertically
- Dark gradient background: linear-gradient(180deg, bg-primary 0%, #0F172A 100%)
- Subtle animated background: floating translucent gradient orbs (3 orbs, slow drift, 20s cycle)

**Content (top to bottom, centered, max-width 380px):**
1. **Logo area** (48px margin-bottom)
   - Shield icon with gradient fill (brand-primary to brand-secondary), 56px
   - "Health Credit" -- display typography, text-primary
   - "Your encrypted health wallet" -- body, text-secondary

2. **Form card** (glass morphism container, padding 32px, border-radius lg)
   - Email input (MUI TextField, dark variant, bg-surface background, rounded sm)
   - Password input (same styling, with show/hide toggle)
   - "Login" button (full width, brand-primary bg, white text, height 48px, border-radius sm)
     - Hover: lighten 10%
     - Loading: spinner replaces text
   - Divider with "or" text (optional, for future social login)

3. **Footer link**
   - "Don't have an account? Create one" -- body, text-secondary, link in brand-accent

**No horizontal AppBar on login/register.**

### 5.2 Register Page

**Identical layout to Login** with these differences:
- Heading: "Create Account"
- Subheading: "Start your encrypted health wallet"
- Three fields: Email, Password (with strength indicator bar below), Confirm Password
- Password strength bar: 4 segments, colors from error to success
- Button: "Create Account"
- Footer: "Already have an account? Login"

### 5.3 Home Page (Wallet Dashboard)

This is the most critical redesign. Currently a dead-end placeholder. It becomes the wallet.

**Layout:**
- No centered hero. Full-width content.
- Top section: greeting + stats
- Main section: CardStack
- Quick actions: floating action buttons

**Content (top to bottom):**

1. **Header area** (within Layout, 24px padding)
   - "Good [morning/afternoon], [name]" -- h1, text-primary
   - Row of stat pills:
     - "[N] documents" -- glass pill
     - "[N] active shares" -- glass pill
     - "All encrypted" -- TrustBadge variant=encrypted

2. **Card Stack** (main content, centered)
   - If documents exist: CardStack component showing all documents as HealthCards
   - If no documents: Empty state (see below)

3. **Quick Actions** (bottom of viewport, above BottomNav on mobile)
   - Floating action button cluster:
     - Primary FAB: "+" icon (Upload) -- brand-primary, 56px
     - Secondary FAB: "Share" icon -- brand-secondary, 48px
   - On desktop: these are inline buttons instead of FABs

4. **Empty State** (when no documents)
   - Large shield icon (64px, text-tertiary, subtle float animation)
   - "Your wallet is empty" -- h2, text-primary
   - "Upload your first health document to get started" -- body, text-secondary
   - "Upload Document" button (brand-primary, large)
   - Three feature pills below:
     - "End-to-end encrypted"
     - "You control sharing"
     - "Auto-expiring links"
   - Each pill: glass-bg, caption text, small icon

### 5.4 Upload Page

**Layout:**
- Max-width 500px, centered
- Glass morphism container for the form area

**Content (top to bottom):**

1. **Page header**
   - "Upload Document" -- h1
   - "Files are encrypted in your browser before upload" -- body, text-secondary
   - TrustBadge variant=encrypted, inline

2. **Document type selector** (NEW)
   - Horizontal scrolling row of type pills:
     - "STI Results" | "Vaccination" | "Blood Work" | "General"
   - Each pill: outlined by default, filled with gradient on select
   - This determines the card gradient color

3. **Drop zone** (redesigned)
   - Rounded container (border-radius lg), dashed border 2px in glass-border color
   - Gradient border on hover/drag-over (brand-primary animated dash)
   - Center: upload cloud icon (40px, text-tertiary)
   - "Drop files here or tap to browse" -- body, text-secondary
   - "PDF, JPG, PNG up to 10MB" -- caption, text-tertiary
   - When files selected: drop zone shrinks, file chips appear below with X to remove

4. **Encryption password field**
   - Glass container with lock icon prefix
   - Helper text: "This password encrypts your files. Keep it safe -- we cannot recover it."
   - Password strength indicator bar

5. **Upload button**
   - Full width, brand-primary, 48px height
   - Icon: lock
   - Text: "Encrypt & Upload"
   - On upload: button transforms into EncryptionProgress component
   - On complete: success animation (checkmark burst), then preview of the HealthCard that was created

### 5.5 Documents Page

**Layout:**
- Grid of HealthCards (not a list)
- 1 column on mobile, 2 on tablet, 3 on desktop
- Gap: 16px

**Content:**

1. **Page header**
   - "My Documents" -- h1
   - "[N] documents, all encrypted" -- body, text-secondary with TrustBadge

2. **Filter/Sort bar** (NEW)
   - Horizontal pill row: "All" | "STI" | "Vaccine" | "Blood" | "General"
   - Sort dropdown: "Newest" | "Oldest" | "Name"
   - All in glass-bg containers

3. **Document grid**
   - Each document rendered as HealthCard (compact size)
   - Tap: expand card (full size, centered overlay) with document actions:
     - "Share" button (brand-primary)
     - "Download" button (outlined)
     - "Delete" button (error color, small, bottom)
     - Close X in top-right
   - Card expand animation: shared element transition (card scales from grid position to center), 300ms ease-out

4. **Empty state**
   - Same as Home empty state but with "Upload your first document" CTA

### 5.6 Shares Page

**Layout:**
- List of active shares as horizontal cards
- Create share is a bottom sheet (mobile) or side panel (desktop)

**Content:**

1. **Page header**
   - "Share Links" -- h1
   - "Create secure, expiring links to your documents" -- body, text-secondary

2. **Create Share button**
   - Prominent, full-width on mobile: "Create Share Link" with share icon
   - Opens bottom sheet (mobile) or dialog (desktop)

3. **Active shares list**
   - Each share is a glass card:
     - Left: mini HealthCard preview (just the gradient + type icon, 48x48px thumbnail)
     - Center: share info
       - "[N] document(s)" -- body
       - Row of TrustBadges: expiry countdown, view count, view limit
     - Right: action icons (copy link, QR code, revoke)
   - Expired shares: dimmed (opacity 0.5), "Expired" badge, strikethrough on info

4. **Create Share flow** (bottom sheet / dialog, redesigned)
   - Step 1: Select documents (HealthCard checkboxes, not a list)
   - Step 2: Configure (expiry selector as pill row, max views as stepper)
   - Step 3: Reveal (ShareReveal component -- card flip with QR code)
   - Steps shown as subtle progress dots at top of sheet
   - Transitions between steps: horizontal slide (300ms)

5. **Empty state**
   - "No active shares" -- h2
   - "Share your health documents securely with expiring links" -- body
   - "Create Your First Share" button

### 5.7 SharedView Page (public, unauthenticated)

This is what the RECIPIENT sees. It must be trustworthy and premium.

**Layout:**
- Full viewport, centered content
- Dark background with subtle brand gradient
- No navigation bar -- this is a standalone page

**Content:**

1. **Header**
   - HC shield logo (small, 32px) + "Health Credit" -- h3
   - "Verified Shared Document" -- caption, brand-accent, with shield-check icon

2. **Share info card** (glass morphism, centered, max-width 420px)
   - Row of TrustBadges: encrypted, view count, expiry
   - "[N] document(s) shared with you" -- h2
   - "These documents are end-to-end encrypted. Enter the password provided by the sender." -- body, text-secondary

3. **Decrypt form**
   - Password input (dark, with lock icon prefix)
   - "Decrypt & View" button (brand-primary, full width, with lock-open icon)
   - Loading: EncryptionProgress component (stage: 'encrypting' label changed to 'Decrypting...')

4. **After decryption**
   - Each document displayed as a full HealthCard with the actual content below it
   - Images: displayed inline with rounded corners and subtle shadow
   - PDFs: embedded viewer with dark-themed controls
   - "Verified by Health Credit" footer badge
   - "This share expires [date]" warning if < 24h remaining

5. **Error / Expired states**
   - Expired: shield-x icon (64px, error color), "This share has expired", "The sender's share link is no longer active."
   - Wrong password: shake animation on input (300ms), error message below
   - Link not found: "Share not found" with suggestion to "Contact the sender for a new link"

---

## 6. Animation Specifications

### Global Transitions

```
Page transitions:
  - Route change: fade (200ms) + subtle slide-up (8px translateY, 200ms)
  - Easing: cubic-bezier(0.4, 0, 0.2, 1) (MUI standard)

Shared element transitions (card expand):
  - Duration: 300ms
  - Easing: cubic-bezier(0.34, 1.56, 0.64, 1) (spring-like overshoot)
  - Use Framer Motion layoutId for seamless card-to-overlay transitions
```

### Card Animations

```
Card hover (desktop):
  - scale: 1 -> 1.02
  - shadow: add glow
  - Duration: 150ms ease-out

Card tap (mobile):
  - scale: 1 -> 0.97 -> 1
  - Duration: 100ms -> 100ms

Card flip (ShareReveal):
  - rotateY: 0deg -> 180deg
  - Duration: 600ms
  - Easing: cubic-bezier(0.68, -0.55, 0.265, 1.55) (back-and-overshoot)
  - Use perspective(1200px) on parent
  - backface-visibility: hidden on both faces
  - Front face: 0deg default
  - Back face: pre-rotated 180deg

Card stack reorder:
  - Spring animation: stiffness 300, damping 30
  - Duration: auto (spring physics)
```

### Micro-interactions

```
Lock close animation (encryption):
  - Lock shackle rotates from 30deg to 0deg
  - Duration: 400ms ease-out
  - Followed by: subtle pulse (scale 1 -> 1.1 -> 1, 200ms)

Checkmark appear (success):
  - SVG path draw: stroke-dashoffset animation
  - Duration: 500ms
  - Easing: ease-out
  - Followed by: subtle particle burst (optional, 8 small dots radiate outward and fade)

Copy to clipboard:
  - Icon morphs from copy to checkmark (200ms)
  - Tooltip: "Copied!" with slide-up + fade (200ms)
  - Revert after 2s

Button loading:
  - Text fades out (100ms)
  - Spinner fades in (100ms)
  - Button width does not change (maintain layout)

Toast/Snackbar:
  - Slide up from bottom + fade in (200ms)
  - Auto-dismiss after 3s
  - Slide down + fade out (150ms)
  - Use brand colors: success = emerald, error = red, info = blue

Background orbs (login/register):
  - 3 gradient circles, 200-400px diameter
  - Opacity: 0.08 - 0.15
  - Animation: slow drift (translateX, translateY), 15-25s per cycle, infinite
  - Each orb has different timing and path
  - Colors: brand-primary, brand-secondary, brand-accent (one each)
  - Blur: 80px
```

### Loading States

```
Skeleton cards:
  - HealthCard shape (220px height, 24px border-radius)
  - Shimmer animation: linear-gradient moving left-to-right
  - Gradient: bg-surface -> bg-surface-hover -> bg-surface
  - Duration: 1.5s, infinite
  - 2-3 skeleton cards shown while loading

Spinner:
  - Use brand-primary color
  - Circular, 2px stroke
  - Indeterminate: standard rotation
```

---

## 7. Implementation Priority

### Phase 1 -- Foundation (do first)

1. **Theme overhaul** (`theme.ts`)
   - Replace entire color palette with new design system
   - Set dark mode as default and only mode (remove toggle)
   - Update typography scale
   - Update border radius scale
   - Override MUI component defaults

2. **HealthCard component**
   - Build the core card with gradient backgrounds
   - Document type detection and gradient mapping
   - TrustBadge sub-component

3. **BottomNav component**
   - Mobile navigation
   - Active state indicator

4. **Layout update**
   - Dark AppBar with glass morphism (desktop)
   - Bottom nav on mobile
   - Page transition wrapper (fade + slide)

### Phase 2 -- Core Pages

5. **Login / Register redesign**
   - Glass morphism form card
   - Background gradient orbs
   - Logo and branding

6. **Home page -> Wallet Dashboard**
   - CardStack component
   - Greeting header with stats
   - Empty state design
   - Quick action FABs

7. **Documents page -> Card Grid**
   - Grid layout with HealthCards
   - Card expand overlay
   - Filter/sort bar

### Phase 3 -- Sharing Experience

8. **ShareReveal component**
   - Card flip animation
   - QR code generation
   - Copy link UX

9. **Shares page redesign**
   - Active share cards with TrustBadges
   - Create share bottom sheet / dialog
   - Step-by-step create flow

10. **SharedView page redesign**
    - Trust-inspiring recipient view
    - Branded decrypt experience
    - Error/expired states

### Phase 4 -- Polish

11. **EncryptionProgress component**
    - Lock animation
    - Stage transitions
    - Success burst

12. **Upload page redesign**
    - Document type selector
    - Redesigned drop zone
    - Upload-to-card preview transition

13. **Micro-interactions**
    - All hover/tap animations
    - Copy feedback
    - Toast styling

---

## Libraries to Add

```
framer-motion        -- animations, layout transitions, gesture handling
qrcode.react         -- QR code generation for ShareReveal
@fontsource/inter    -- Inter font (self-hosted, no Google Fonts flicker)
```

---

## Figma Handoff Notes

If Figma designs are created for these specs, focus on:
1. HealthCard component in all gradient variants
2. CardStack interaction states
3. ShareReveal flip sequence (4 keyframes: front, mid-flip, back, settled)
4. Login page with orb positions
5. Mobile vs desktop layout breakpoints
6. Empty states for all pages

---

## File Structure for New Components

```
src/
  components/
    wallet/
      HealthCard.tsx
      CardStack.tsx
      ShareReveal.tsx
      TrustBadge.tsx
      EncryptionProgress.tsx
    navigation/
      BottomNav.tsx
    layout/
      PageTransition.tsx
      GlassContainer.tsx
      BackgroundOrbs.tsx
  theme.ts              (full overhaul)
  constants/
    gradients.ts        (card gradient definitions)
    animations.ts       (shared animation configs for framer-motion)
```
