# Mobile Responsive Testing Guide

## Quick Test Checklist

### Testing in Browser (Chrome DevTools)
1. Open Chrome DevTools (F12)
2. Click the device toolbar icon (Ctrl+Shift+M)
3. Test these breakpoints:
   - **Mobile:** 375px (iPhone SE)
   - **Mobile Large:** 414px (iPhone 12 Pro)
   - **Tablet:** 768px (iPad)
   - **Desktop:** 1024px and above

### Features to Test

#### 1. ChatInterface
- [ ] Quick action buttons stack properly on mobile
- [ ] Input and send button layout correct on mobile
- [ ] Messages display properly at all sizes
- [ ] No horizontal scrolling

#### 2. AIResearchAssistant
- [ ] Tabs collapse to 2 columns on mobile with emoji icons
- [ ] Search textarea readable size
- [ ] Suggestion buttons full width on mobile
- [ ] Results display properly
- [ ] Sources grid stacks vertically on mobile

#### 3. Article Writer
- [ ] Form inputs stack properly
- [ ] Text editor readable on mobile
- [ ] Buttons group properly
- [ ] Article preview works on mobile

#### 4. TextStructureFixer
- [ ] Settings panel displays above content on mobile
- [ ] Tabs show emoji icons on mobile
- [ ] Textarea proper height
- [ ] No horizontal scrolling in results

#### 5. TaskPlanner
- [ ] Task type buttons stack to single column on mobile
- [ ] Input fields proper size
- [ ] Task list readable
- [ ] Buttons accessible

#### 6. SummarizerParaphraser
- [ ] Input textarea proper height on mobile
- [ ] Tabs work correctly
- [ ] Results display properly
- [ ] Copy buttons accessible

#### 7. OCRExtractor
- [ ] Upload area displays properly
- [ ] Extracted text readable
- [ ] Controls accessible
- [ ] Results formatted correctly

#### 8. StudyAnalyticsDashboard
- [ ] Stats cards display in 2 columns on mobile
- [ ] Tabs collapse to 2 rows on mobile
- [ ] Charts display properly
- [ ] Progress bars visible

#### 9. KurdishDialectTranslator
- [ ] Translation areas stack vertically on mobile
- [ ] Textareas proper height
- [ ] Dictionary items display in single column
- [ ] Tabs show emoji icons
- [ ] Swap button accessible

#### 10. AI Content Humanizer
- [ ] Header displays properly
- [ ] Input area accessible
- [ ] Results readable
- [ ] Progress bar visible

### Common Issues to Check

1. **Text Readability**
   - [ ] No text too small to read (minimum 14px on mobile)
   - [ ] Proper line height maintained
   - [ ] Kurdish text displays correctly

2. **Layout**
   - [ ] No horizontal scrolling
   - [ ] Proper spacing between elements
   - [ ] Cards have proper padding
   - [ ] Grids collapse to single column when needed

3. **Inputs & Forms**
   - [ ] Input fields proper size
   - [ ] Textareas not too tall or short
   - [ ] Buttons accessible (not too small)
   - [ ] Labels properly aligned

4. **Navigation**
   - [ ] Tabs accessible
   - [ ] Back buttons work
   - [ ] Mobile sidebar trigger works
   - [ ] Navigation doesn't break layout

5. **Dynamic Content**
   - [ ] AI response containers don't break layout
   - [ ] Streaming text displays properly
   - [ ] Loading states work correctly
   - [ ] Error messages visible

### Test Workflow

For each feature:
1. Open the feature on desktop (>1024px)
2. Verify original functionality works
3. Resize to tablet (768px)
   - Check 2-column layouts
   - Verify text sizes
4. Resize to mobile (375px)
   - Verify single column layout
   - Check all interactive elements accessible
   - Test AI response generation
   - Verify no layout breaks after response

### Breakpoints Used

```css
/* Tailwind breakpoints */
sm: 640px   /* Small devices (landscape phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (desktops) */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X Extra large devices */
```

### Responsive Classes Reference

#### Grid Layouts
- Mobile: `grid-cols-1`
- Tablet: `sm:grid-cols-2` or `md:grid-cols-2`
- Desktop: `lg:grid-cols-3` or `lg:grid-cols-4`

#### Text Sizes
- Mobile: `text-xs` to `text-sm`
- Tablet: `sm:text-base`
- Desktop: `md:text-lg` or `lg:text-xl`

#### Spacing
- Mobile: `p-3 gap-2`
- Tablet: `sm:p-4 sm:gap-3`
- Desktop: `md:p-6 md:gap-6`

#### Heights
- Mobile: `min-h-[150px]`
- Tablet: `sm:min-h-[200px]`
- Desktop: `md:min-h-[300px]`

## Browser Testing

Test in multiple browsers:
- [ ] Chrome (Desktop & Mobile)
- [ ] Firefox (Desktop & Mobile)
- [ ] Safari (iOS)
- [ ] Edge (Desktop)

## Device Testing

If possible, test on actual devices:
- [ ] iPhone (any model)
- [ ] Android phone
- [ ] iPad or Android tablet
- [ ] Desktop monitor

## Performance Check

- [ ] Page loads quickly on mobile
- [ ] Animations smooth
- [ ] Scrolling smooth
- [ ] No layout shifts during load

## Accessibility Check

- [ ] All buttons have proper touch targets (minimum 44x44px)
- [ ] Form inputs accessible via keyboard
- [ ] Focus states visible
- [ ] Color contrast sufficient

## Report Issues

If you find issues:
1. Note the device/browser
2. Note the screen size
3. Take a screenshot
4. Describe the issue
5. Note steps to reproduce
