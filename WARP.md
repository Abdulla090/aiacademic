# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is **Shifa Kurdish Academic Hub**, a bilingual (English/Kurdish) web application that provides AI-powered academic tools for students and researchers. The application is built as a single-page application using React, TypeScript, and modern web technologies.

## Development Commands

### Essential Commands
```powershell
# Install dependencies
npm i

# Start development server
npm run dev
# Runs on http://localhost:8080

# Build for production
npm run build

# Build for development environment
npm run build:dev

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Testing Individual Components
There are no dedicated test commands set up. Components can be tested by navigating to their respective routes in the development server.

## Architecture Overview

### Tech Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom CSS variables
- **UI Components**: shadcn/ui component library
- **Routing**: React Router v6
- **State Management**: React hooks and context
- **Internationalization**: i18next for English/Kurdish/Arabic support
- **AI Integration**: Google Gemini API for content generation
- **PDF Generation**: jsPDF with custom Arabic/Kurdish font support

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── [FeatureName].tsx # Feature-specific components
├── pages/              # Route components
├── services/           # API services (Gemini AI)
├── hocs/               # Higher-order components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and fonts
└── locales/            # Translation files
```

### Key Architectural Patterns

**1. Route-Based Architecture**
- Each major feature is both a page component (`/pages/`) and a reusable component (`/components/`)
- The `App.tsx` uses `withLoading` HOC for all major routes
- Sidebar navigation is conditionally shown (hidden on landing page)

**2. Internationalization**
- All user-facing text uses `useTranslation()` hook
- Supports English (`en`), Sorani Kurdish (`ku`), and Arabic (`ar`)
- Text direction handled with CSS classes (`sorani-text`, `latin-text`)
- Custom font loading for Arabic/Kurdish scripts

**3. AI Service Integration**
- Centralized AI service in `services/geminiService.ts`
- Type-safe interfaces for all AI requests and responses
- Error handling with toast notifications

**4. UI Component System**
- Built on shadcn/ui with extensive customization
- Academic-themed variants (`btn-academic-primary`, `card-academic`)
- Consistent spacing and color system using CSS variables

## Important Development Guidelines

### AI Service Usage
- **API Key**: Currently hardcoded in `geminiService.ts` - move to environment variable for production
- **Rate Limiting**: No rate limiting implemented - consider adding for production
- **Error Handling**: Always wrap AI calls in try-catch with user-friendly error messages

### Internationalization Best Practices
- Always use `t('key')` for user-facing text, never hardcode strings
- Add new translation keys to both `/locales/en/translation.json` and `/locales/ku/translation.json`
- Use `sorani-text` class for right-to-left text display
- Test all features in both English and Kurdish to ensure proper text direction

### Component Development
- Most features have both a page component and a reusable component version
- Use the `withLoading` HOC for new pages that need loading states
- Follow the established pattern of feature-specific components in `/components/`
- Use shadcn/ui components as base, extend with custom academic styling

### PDF Generation
- Custom Arabic/Kurdish font support is implemented in `lib/fonts.ts`
- Always handle RTL text alignment for Kurdish/Arabic content
- PDF generation includes proper font loading and text direction handling

### Styling Conventions
- Academic theme with custom CSS variables defined in global styles
- Use Tailwind classes with custom academic variants
- Consistent card, button, and input styling throughout
- Dark mode support with `dark:` prefixes

### File Processing Features
- Multiple file format support (PDF, DOCX, images)
- Text extraction and processing for academic content
- File compression and format conversion utilities

## Common Development Tasks

### Adding a New Academic Tool
1. Create page component in `/pages/[ToolName].tsx`
2. Create reusable component in `/components/[ToolName].tsx`
3. Add route in `App.tsx` with `withLoading` HOC
4. Add sidebar navigation item in `CustomSidebar.tsx`
5. Add tool card in `Dashboard.tsx` academic tools array
6. Add translation keys for both English and Kurdish
7. Implement AI service methods if needed

### Modifying AI Prompts
- All AI prompts are in `services/geminiService.ts`
- Consider language-specific prompting for Kurdish content
- Always include proper response format instructions
- Add type safety for request/response interfaces

### Adding New Language Support
1. Create new translation file in `/locales/[lang]/translation.json`
2. Add language to `i18n.ts` resources
3. Update `LanguageSwitcher.tsx` to include new option
4. Test RTL support if applicable

### Customizing Academic Theme
- Modify CSS variables in global styles
- Academic color palette is defined in `tailwind.config.ts`
- Use existing academic component variants for consistency

## File Dependencies

### Critical Files Not to Break
- `src/services/geminiService.ts` - All AI functionality depends on this
- `src/i18n.ts` - Internationalization configuration
- `src/components/CustomSidebar.tsx` - Main navigation
- `tailwind.config.ts` - All styling depends on custom theme configuration
- `src/lib/fonts.ts` - Required for PDF generation in Arabic/Kurdish

### Environment Configuration
- Development server runs on port 8080
- Vite configured for IPv6 (`::`) binding
- Path aliases: `@/` maps to `./src/`
- TypeScript configured with relaxed settings for rapid development

