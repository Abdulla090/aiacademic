# RTL (Right-to-Left) Implementation for Kurdish Language

## Overview
This document describes the comprehensive RTL support implementation for the Kurdish language across the entire application.

## Changes Made

### 1. i18n Configuration (`src/i18n.ts`)
- **Added**: `i18n.dir()` function that returns 'rtl' for Kurdish/Arabic languages and 'ltr' for others
- **Languages with RTL**: 'ku', 'ar', 'ckb', 'ar-SA'

```typescript
i18n.dir = (lng?: string) => {
  const language = lng || i18n.language;
  return ['ku', 'ar', 'ckb', 'ar-SA'].includes(language) ? 'rtl' : 'ltr';
};
```

### 2. Global CSS Styles (`src/index.css`)
Added comprehensive RTL utility classes that automatically apply when `dir="rtl"` is set on an element:

#### Direction Utilities
- `[dir="rtl"]` - Sets direction to RTL
- `[dir="ltr"]` - Sets direction to LTR

#### Flexbox Reversal
- `flex-row` → `flex-row-reverse` in RTL
- `flex-row-reverse` → `flex-row` in RTL

#### Text Alignment
- `text-left` → `text-right` in RTL
- `text-right` → `text-left` in RTL

#### Justify Content
- `justify-end` → `justify-start` in RTL
- `justify-start` → `justify-end` in RTL

#### Spacing Utilities
- Margin: `ml-*` ↔ `mr-*` swap in RTL
- Padding: `pl-*` ↔ `pr-*` swap in RTL

#### Border and Border Radius
- `border-l` ↔ `border-r` swap in RTL
- `rounded-l` ↔ `rounded-r` swap in RTL

### 3. Component Updates

#### AcademicToolCard (`src/components/AcademicToolCard.tsx`)
- **Added**: RTL detection using `i18n.dir()`
- **Updated**: Card header flex layout with `space-x-reverse` and `flex-row-reverse` for RTL
- **Updated**: Title and description text alignment based on language direction
- **Updated**: Button positioning (justify-start for RTL, justify-end for LTR)

```tsx
const isRTL = i18n.dir() === 'rtl';

// Header with proper icon-text spacing in RTL
<div className={`flex items-center ${isRTL ? 'space-x-reverse flex-row-reverse' : ''} space-x-3`}>
  <Icon />
  <div className="flex-1">
    <CardTitle className={`${isRTL ? 'text-right' : 'text-left'}`}>
      {t(title)}
    </CardTitle>
  </div>
</div>

// Button positioning
<div className={`w-full flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
  <Button>{t('open')}</Button>
</div>
```

#### LandingPage (`src/pages/LandingPage.tsx`)
- **Added**: RTL detection and `dir` attribute to root div
- **Updated**: Header flex layout to reverse in RTL
- **Updated**: Arrow icon positioning and rotation for RTL
  - Icon appears before text in RTL
  - Icon is rotated 180° for proper direction indication

```tsx
const isRTL = i18n.dir() === 'rtl';

<div dir={i18n.dir()}>
  <header className={`${isRTL ? 'flex-row-reverse' : ''}`}>
    {/* Header content */}
  </header>
  
  {/* RTL-aware button with icon */}
  {isRTL ? (
    <>
      <ArrowRight className="mr-2 rotate-180" />
      {t('quickActionsTitle')}
    </>
  ) : (
    <>
      {t('quickActionsTitle')}
      <ArrowRight className="ml-2" />
    </>
  )}
</div>
```

#### MobileBottomNav (`src/components/MobileBottomNav.tsx`)
- **Added**: RTL detection
- **Updated**: Navigation items order with `flex-row-reverse` in RTL
- **Updated**: Label text switching between Kurdish and English based on language direction

```tsx
const isRTL = i18n.dir() === 'rtl';

<div dir={i18n.dir()}>
  <div className={`flex ${isRTL ? 'flex-row-reverse' : ''}`}>
    {/* Navigation items */}
    <span>{isRTL ? item.label : item.labelEn}</span>
  </div>
</div>
```

#### Dashboard (`src/pages/Dashboard.tsx`)
- **Already implemented**: `dir={i18n.dir()}` attribute on main container
- All dashboard content automatically inherits RTL layout

#### App Component (`src/App.tsx`)
- **Already implemented**: Automatic direction detection in useEffect
```tsx
useEffect(() => {
  document.documentElement.dir = i18n.dir();
  document.documentElement.lang = i18n.language;
  document.body.classList.toggle('rtl', i18n.dir() === 'rtl');
}, [i18n, i18n.language]);
```

## How It Works

### Automatic RTL Detection
1. User switches language to Kurdish using the language switcher
2. `i18n.language` changes to 'ku'
3. `i18n.dir()` returns 'rtl'
4. App.tsx useEffect updates `document.documentElement.dir` to 'rtl'
5. CSS rules with `[dir="rtl"]` selector automatically apply
6. Components using `isRTL` variable adjust their layouts

### Manual Component Adjustments
For components that need specific RTL behavior:
```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  
  return (
    <div className={`flex ${isRTL ? 'flex-row-reverse' : ''}`}>
      {/* Content */}
    </div>
  );
};
```

## Testing RTL Layout

### Steps to Test:
1. Open the application
2. Navigate to Dashboard
3. Click on language switcher in the sidebar or settings
4. Select "کوردی" (Kurdish)
5. Observe:
   - All text aligns to the right
   - Cards display with icons on the right side
   - Buttons appear on the left side
   - Navigation flows from right to left
   - Arrows point in the correct direction

### Components to Verify:
- ✅ Landing Page
- ✅ Dashboard (category cards)
- ✅ AcademicToolCard (all tool cards)
- ✅ Sidebar navigation
- ✅ Mobile bottom navigation
- ✅ All page layouts inherit RTL from App.tsx

## Browser Support
RTL support is built using standard CSS and React patterns, compatible with all modern browsers:
- Chrome/Edge (Chromium-based)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements
- Consider adding RTL-specific animations
- Test with more complex layouts (tables, forms with multiple columns)
- Add RTL support for any new components added to the application

## Notes
- Kurdish language (ku) is primarily RTL
- The application now fully supports bidirectional text layout
- All spacing, margins, and layout directions automatically adjust
- Icons and UI elements properly position themselves based on language direction
