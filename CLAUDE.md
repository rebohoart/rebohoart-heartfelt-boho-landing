# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Rebohoart e-commerce site** built with the Lovable platform. It's a full-featured e-commerce application with shopping cart, checkout, custom orders, and admin backoffice, featuring a warm, natural boho aesthetic with custom animations.

**Tech Stack:**
- Vite (build tool with SWC)
- React 18 + TypeScript
- shadcn/ui component library
- Tailwind CSS
- React Router v6
- TanStack Query (React Query)
- React Hook Form + Zod
- Supabase (database, auth, storage, edge functions)

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

The application follows a standard React SPA architecture with Supabase backend:

- **`src/main.tsx`** - Application entry point
- **`src/App.tsx`** - Root component that configures:
  - React Router (BrowserRouter)
  - TanStack Query (QueryClientProvider)
  - Toast notifications (Toaster, Sonner)
  - Tooltip provider
  - Context providers (AuthProvider, CartProvider)

- **`src/pages/`** - Route-level page components
  - `Index.tsx` - Main landing page with product showcase
  - `Contact.tsx` - Contact form page (`/contacto`)
  - `Auth.tsx` - Authentication page (`/auth`)
  - `Backoffice.tsx` - Admin panel for managing products and orders (`/backoffice`)
  - `NotFound.tsx` - 404 page (catch-all route)

### Component Organization

- **`src/components/`** - Feature/section components:
  - **Landing page sections:**
    - `Hero.tsx` - Hero section
    - `ProductHighlights.tsx` - Product showcase with grid
    - `Testimonials.tsx` - Customer testimonials
    - `BrandStory.tsx` - Brand narrative
    - `FinalCTA.tsx` - Call-to-action

  - **E-commerce components:**
    - `Navigation.tsx` - Site navigation with cart button
    - `Footer.tsx` - Site footer
    - `CartDrawer.tsx` - Shopping cart sidebar (using Vaul drawer)
    - `CheckoutForm.tsx` - Checkout form with order submission
    - `CustomOrderButton.tsx` - Button to trigger custom order form
    - `CustomOrderForm.tsx` - Form for custom product requests
    - `ProductImageGallery.tsx` - Image gallery with Embla carousel

- **`src/components/ui/`** - shadcn/ui library components (~50 components)
  - Pre-built, customizable UI primitives
  - Modified through Tailwind CSS variables and component props

- **`src/contexts/`** - React Context providers
  - `AuthContext.tsx` - Authentication state and user management
  - `CartContext.tsx` - Shopping cart state management

- **`src/integrations/supabase/`** - Supabase integration
  - `client.ts` - Supabase client configuration
  - `types.ts` - TypeScript types generated from database schema

- **`src/lib/`** - Utility functions (e.g., `utils.ts` with `cn()` helper)
- **`src/hooks/`** - Custom React hooks (e.g., `use-toast`, `use-mobile`)

### Routing

Routes are defined in `src/App.tsx`:
- `/` - Index page (landing/shop)
- `/contacto` - Contact form
- `/auth` - Authentication (login/signup)
- `/backoffice` - Admin panel (requires admin authentication)
- `*` - Catch-all for 404

**Important:** Add all custom routes ABOVE the catch-all `*` route.

### Path Aliases

The project uses `@` as an alias for the `src/` directory:
```typescript
import Hero from "@/components/Hero";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
```

Configured in:
- `vite.config.ts` (build-time resolution)
- `components.json` (shadcn/ui configuration)

## Supabase Integration

### Setup

The project requires the following environment variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anonymous/public key

These are typically stored in a `.env` file (not committed to git).

### Database Schema

Key tables:
- **`products`** - Product catalog with images, prices, categories
- **`orders`** - Customer orders with line items
- **`custom_orders`** - Custom product requests from customers

Database migrations are in `supabase/migrations/`.

### Edge Functions

- **`send-order-email`** - Supabase Edge Function for sending order confirmation emails

### Authentication

- Uses Supabase Auth with email/password
- Admin users are managed through the `AuthContext`
- Protected routes check authentication status via `useAuth` hook

### Data Fetching

Use TanStack Query with Supabase client:
```typescript
const { data: products } = useQuery({
  queryKey: ['products'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true);
    if (error) throw error;
    return data;
  }
});
```

## Context Providers

### AuthContext

Located in `src/contexts/AuthContext.tsx`. Provides:
- `user` - Current authenticated user
- `isAdmin` - Whether user has admin privileges
- `loading` - Auth loading state
- `signIn` - Sign in function
- `signUp` - Sign up function
- `signOut` - Sign out function

Usage:
```typescript
import { useAuth } from "@/contexts/AuthContext";

const { user, isAdmin, signOut } = useAuth();
```

### CartContext

Located in `src/contexts/CartContext.tsx`. Provides:
- `items` - Cart items with quantities
- `addItem` - Add product to cart
- `removeItem` - Remove product from cart
- `updateQuantity` - Update item quantity
- `clearCart` - Clear all items
- `total` - Total cart value

Usage:
```typescript
import { useCart } from "@/contexts/CartContext";

const { items, addItem, total } = useCart();
```

## Styling and Theming

### Tailwind Configuration

The project uses a **custom Tailwind theme** with a warm, boho aesthetic:

- **Custom Fonts:**
  - `font-serif`: Cinzel (headings, decorative text)
  - `font-sans`: Montserrat (body text)

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

1. **State Management:**
   - Server state: TanStack Query with Supabase
   - Auth state: AuthContext provider
   - Cart state: CartContext provider
   - Local state: React hooks

2. **Forms:** Use React Hook Form with Zod for validation when creating forms.

3. **TypeScript:** Strict mode is enabled. All components should be properly typed. Supabase types are auto-generated in `src/integrations/supabase/types.ts`.

4. **Component Pattern:**
   - Page components compose smaller feature components
   - E-commerce functionality is split between contexts, components, and Supabase queries

5. **Vite Configuration:**
   - Dev server runs on `::` (all IPv6 addresses) port 8080
   - Uses SWC for faster compilation
   - Path alias `@` points to `src/`

6. **Admin Panel:**
   - Access via `/backoffice` route
   - Protected by authentication check in `Backoffice.tsx`
   - Requires admin privileges (checked via `isAdmin` from AuthContext)
   - Allows CRUD operations on products and viewing orders
