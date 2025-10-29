# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Rebohoart heartfelt boho landing page** built with the Lovable platform. It's a single-page React application featuring a warm, natural aesthetic with custom animations and a boho design theme.

**Tech Stack:**
- Vite (build tool with SWC)
- React 18 + TypeScript
- shadcn/ui component library
- Tailwind CSS
- React Router v6
- TanStack Query (React Query)
- React Hook Form + Zod

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build for development (with source maps and dev mode)
npm run build:dev

# Run ESLint
npm run lint

# Preview production build
npm run preview
```

## Project Architecture

### Application Structure

The application follows a standard React SPA architecture:

- **`src/main.tsx`** - Application entry point
- **`src/App.tsx`** - Root component that configures:
  - React Router (BrowserRouter)
  - TanStack Query (QueryClientProvider)
  - Toast notifications (Toaster, Sonner)
  - Tooltip provider
- **`src/pages/`** - Route-level page components
  - `Index.tsx` - Main landing page (default route)
  - `NotFound.tsx` - 404 page (catch-all route)

### Component Organization

- **`src/components/`** - Feature/section components for the landing page:
  - `Hero.tsx` - Hero section
  - `ProductHighlights.tsx` - Product showcase
  - `Testimonials.tsx` - Customer testimonials
  - `BrandStory.tsx` - Brand narrative
  - `FinalCTA.tsx` - Call-to-action

- **`src/components/ui/`** - shadcn/ui library components (~50 components)
  - These are pre-built, customizable UI primitives
  - Modified through Tailwind CSS variables and component props

- **`src/lib/`** - Utility functions (e.g., `utils.ts` with `cn()` helper)
- **`src/hooks/`** - Custom React hooks (e.g., `use-toast`, `use-mobile`)

### Routing

Routes are defined in `src/App.tsx`:
- `/` - Index page
- `*` - Catch-all for 404

**Important:** Add all custom routes ABOVE the catch-all `*` route.

### Path Aliases

The project uses `@` as an alias for the `src/` directory:
```typescript
import Hero from "@/components/Hero";
import { cn } from "@/lib/utils";
```

Configured in:
- `vite.config.ts` (build-time resolution)
- `components.json` (shadcn/ui configuration)

## Styling and Theming

### Tailwind Configuration

The project uses a **custom Tailwind theme** with a warm, boho aesthetic:

- **Custom Fonts:**
  - `font-serif`: Playfair Display (headings, decorative text)
  - `font-sans`: Inter (body text)

- **Custom Gradients:**
  - `bg-gradient-warm` - Warm color gradient
  - `bg-gradient-natural` - Natural earth tones

- **Custom Shadows:**
  - `shadow-soft` - Soft shadow effect
  - `shadow-warm` - Warm-toned shadow

- **Custom Animations:**
  - `animate-fade-in` - Fade in with slight upward motion
  - `animate-fade-in-up` - Fade in from below
  - `animate-scale-in` - Scale in with fade

### CSS Variables

Theme colors are defined using CSS variables in `src/index.css` and can be modified via HSL values. The project uses `darkMode: ["class"]` for theme switching support.

## shadcn/ui Integration

Components are managed via the shadcn/ui CLI. Configuration in `components.json`:
- Style: `default`
- Base color: `slate`
- CSS variables: enabled
- All components use TypeScript (`.tsx`)

To add new shadcn/ui components:
```bash
npx shadcn@latest add [component-name]
```

## Lovable Integration

This project is connected to Lovable (https://lovable.dev). Key points:

- The `lovable-tagger` plugin runs in development mode for component tracking
- Changes made in Lovable are automatically committed to this repo
- Changes pushed to this repo are reflected in Lovable

## Important Architectural Notes

1. **State Management:** Uses TanStack Query for server state. Local state is managed with React hooks.

2. **Forms:** Use React Hook Form with Zod for validation when creating forms.

3. **TypeScript:** Strict mode is enabled. All components should be properly typed.

4. **Component Pattern:** Landing page sections are composed of smaller components organized by feature/section.

5. **Vite Configuration:**
   - Dev server runs on `::` (all IPv6 addresses) port 8080
   - Uses SWC for faster compilation
   - Path alias `@` points to `src/`
