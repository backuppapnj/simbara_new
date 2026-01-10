# Spec: Frontend UI Foundation

## Overview
Track ini membangun fondasi frontend UI untuk aplikasi Manajemen Aset dan Persediaan, mencakup setup design system, komponen UI reusable, layout structure, halaman login, dan dashboard dengan statistik ringkas.

## Goals
1. Setup dan konfigurasi shadcn/ui + MagicUI
2. Layout structure yang responsif (desktop & mobile)
3. Halaman login yang terintegrasi dengan Fortify backend
4. Dashboard dengan summary statistik dan charts untuk quick overview
5. Custom theming untuk Professional/Government style (Blue/Navy)

## Dependencies
- Backend: Laravel Fortify (authentication sudah tersedia)
- Frontend: React 19, Inertia.js v2, TypeScript, TailwindCSS v4
- UI Libraries:
  - **shadcn/ui** - Base UI components from registry
  - **MagicUI** - Animated UX components (no background effects)
  - lucide-react - Icons
  - @headlessui/react - Untuk components belum ada di shadcn

---

## Scope

### In Scope

#### 1. Setup & Configuration
- Initialize shadcn/ui (`npx shadcn@latest init`)
- Setup components.json dengan proper config
- Install MagicUI components yang diperlukan
- Configure TailwindCSS v4 dengan custom theme
- Define custom color variables (Blue/Navy dominant)

#### 2. Install shadcn/ui Components
**Form Components (dari registry):**
- `@shadcn/input` - Text, email, password inputs
- `@shadcn/textarea` - Multiline text input
- `@shadcn/select` - Dropdown select
- `@shadcn/checkbox` - Checkbox component
- `@shadcn/radio-group` - Radio buttons
- `@shadcn/switch` - Toggle switch
- `@shadcn/label` - Form labels
- `@shadcn/button` - Button dengan variants

**Navigation & Layout:**
- `@shadcn/resizable` - Untuk resizable sidebar
- `@shadcn/sheet` - Mobile drawer/menu
- `@shadcn/dropdown-menu` - User profile dropdown
- `@shadcn/breadcrumb` - Breadcrumbs
- `@shadcn/pagination` - Pagination

**Feedback Components:**
- `@shadcn/alert` - Alert boxes
- `@shadcn/sonner` - Toast notifications
- `@shadcn/dialog` - Modal dialogs
- `@shadcn/sheet` - Side sheets
- `@shadcn/skeleton` - Loading skeletons
- `@shadcn/progress` - Progress bars

**Data Display:**
- `@shadcn/card` - Card containers
- `@shadcn/badge` - Status badges
- `@shadcn/avatar` - User avatars
- `@shadcn/table` - Data tables
- `@shadcn/tabs` - Tab navigation
- `@shadcn/separator` - Visual separators

#### 3. MagicUI Components (Animated UX, No Background Effects)
- Animated Button variants
- Animated Cards
- Border beam effects
- Shimmer button/text
- Moving border
- Typing animation (untuk dashboard welcome)
- Dot pattern (optional, subtle)

#### 4. Custom Layout Components
**DashboardLayout:**
- Sidebar dengan menu items (Aset, ATK, Bahan Kantor, Settings)
- Collapsible via Resizable
- Mobile: Sheet drawer (hamburger menu)
- Header dengan:
  - User profile (Avatar + Dropdown menu)
  - Notifications bell (MagicUI animated bell)
  - Breadcrumb untuk navigation context

**AuthLayout:**
- Centered card layout untuk login
- Background gradient (subtle, professional)
- Logo/branding header

#### 5. Pages

**Login Page (`/login`):**
- Card container dengan MagicUI border effect
- Email Input (shadcn/input)
- Password Input (shadcn/input + show/hide toggle)
- Remember me Checkbox (shadcn/checkbox)
- Login Button (shadcn/button + MagicUI shimmer)
- "Forgot password?" Link (shadcn/link)
- Error/Success alerts (shadcn/alert)
- Integrasi dengan Fortify endpoint menggunakan Inertia `useForm`

**Dashboard (`/dashboard`):**
- Header dengan Welcome message (MagicUI typing animation)
- Summary Cards (shadcn/card + MagicUI hover effects):
  - Total Aset
  - Total ATK Stok
  - Permintaan Pending
  - Aset Rusak
- Charts Section:
  - Line chart: Pengeluaran ATK per bulan
  - Bar chart: Aset per kategori
  - (Gunakan library: recharts atau chart.js dengan React wrapper)
- Quick Action Buttons untuk navigasi ke modul

#### 6. Theming & Styling
**Custom CSS Variables (`globals.css`):**
```css
@theme {
  --color-primary: oklch(0.5 0.15 250); /* Navy blue */
  --color-secondary: oklch(0.6 0.12 250);
  --color-accent: oklch(0.55 0.18 200);
  /* ... government/professional color scheme */
}
```

**Typography:**
- Font family: Inter (via next/font atau Google Fonts)
- Font weights: 400, 500, 600, 700

#### 7. State Management & Utilities
- Auth context provider (user data, permissions check)
- Loading states (shadcn/skeleton)
- Error handling (shadcn/sonner toast)
- Format utilities (currency, date, number Indonesian locale)

### Out of Scope
- Register, Forgot Password, Reset Password, 2FA pages (track terpisah)
- Modul Aset, ATK, Bahan Kantor pages (track terpisah)
- Advanced chart library setup (gunakan library default dulu)
- PWA features (track terpisah)
- Background animasi dari MagicUI

---

## Technical Implementation Details

### Directory Structure
```
resources/js/
├── Components/
│   ├── ui/              # shadcn components (auto-generated)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── layout/          # Custom layout components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── UserMenu.tsx
│   │   └── MobileNav.tsx
│   ├── dashboard/       # Dashboard-specific
│   │   ├── SummaryCard.tsx
│   │   ├── StatsChart.tsx
│   │   └── QuickActions.tsx
│   └── auth/            # Auth-specific
│       └── LoginForm.tsx
├── Pages/
│   ├── Login.tsx
│   └── Dashboard.tsx
├── Layouts/
│   ├── AuthLayout.tsx
│   └── DashboardLayout.tsx
├── Hooks/
│   ├── useAuth.ts
│   └── usePermissions.ts
├── Lib/
│   ├── utils.ts         # cn() helper, formatters
│   └── constants.ts     # App constants
└── Types/
    └── index.ts
```

### Component Installation Workflow
Untuk setiap component yang dibutuhkan:
1. Search: `shadcn___search_items_in_registries`
2. View: `shadcn___view_items_in_registries`
3. Get command: `shadcn___get_add_command_for_items`
4. Install via `npx shadcn@latest add`

### Integration dengan Inertia.js
- `<Link>` dari `@inertiajs/react` untuk navigasi
- `useForm` hook untuk form handling
- `router.visit()` untuk programmatic navigation

### Integration dengan Wayfinder
- Routes dari `@/routes/*` untuk type-safe navigation

### Mock Data untuk Dashboard
- Summary cards: mock hardcoded data
- Charts: mock data arrays
- Akan di-replace dengan real API di track modul terpisah
