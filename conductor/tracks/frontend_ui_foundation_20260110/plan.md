# Plan: Frontend UI Foundation

## Phase 1: Setup & Configuration

### Task 1.1: Initialize shadcn/ui
- [~] Run `npx shadcn@latest init` to initialize shadcn/ui
- [ ] Configure components.json with proper paths and Tailwind v4
- [ ] Update globals.css with custom theme variables
- [ ] Write tests to verify shadcn components can be imported
- [ ] Install required base dependencies (class-variance-authority, clsx, tailwind-merge)

### Task 1.2: Setup MagicUI
- [ ] Add MagicUI repository to components.json
- [ ] Install required MagicUI dependencies
- [ ] Configure MagicUI components in project
- [ ] Write tests to verify MagicUI components work

### Task 1.3: Configure Theme & Styling
- [ ] Define custom color variables in globals.css (Blue/Navy theme)
- [ ] Setup Inter font family
- [ ] Create utils.ts with cn() helper function
- [ ] Test theme variables are properly applied
- [ ] Run `npm run build` to verify no build errors

### Task 1.4: Task: Conductor - User Manual Verification 'Phase 1: Setup & Configuration' (Protocol in workflow.md)

---

## Phase 2: Install UI Components

### Task 2.1: Install Form Components
- [ ] Install: @shadcn/input, @shadcn/textarea, @shadcn/select, @shadcn/checkbox, @shadcn/radio-group, @shadcn/switch, @shadcn/label
- [ ] Verify each component renders correctly
- [ ] Write tests for custom form component variants
- [ ] Run `vendor/bin/pint --dirty` for code style

### Task 2.2: Install Navigation & Layout Components
- [ ] Install: @shadcn/resizable, @shadcn/sheet, @shadcn/dropdown-menu, @shadcn/breadcrumb, @shadcn/pagination
- [ ] Test resizable functionality
- [ ] Test sheet/drawer animations
- [ ] Write tests for navigation components

### Task 2.3: Install Feedback Components
- [ ] Install: @shadcn/alert, @shadcn/sonner, @shadcn/dialog, @shadcn/sheet, @shadcn/skeleton, @shadcn/progress
- [ ] Setup Toaster provider in app
- [ ] Test toast notifications
- [ ] Write tests for alert and skeleton components

### Task 2.4: Install Data Display Components
- [ ] Install: @shadcn/card, @shadcn/badge, @shadcn/avatar, @shadcn/table, @shadcn/tabs, @shadcn/separator
- [ ] Test table with sample data
- [ ] Test avatar fallback functionality
- [ ] Write tests for card and badge components

### Task 2.5: Install MagicUI Components
- [ ] Install: animated-button, border-beam, shimmer button, moving-border, typing-animation
- [ ] Test each MagicUI component
- [ ] Verify animations work without background effects
- [ ] Write tests for component interactivity

### Task 2.6: Task: Conductor - User Manual Verification 'Phase 2: Install UI Components' (Protocol in workflow.md)

---

## Phase 3: Create Layout Components

### Task 3.1: Create AuthLayout [8512abd]
- [x] Create `resources/js/Layouts/AuthLayout.tsx`
- [x] Implement centered card layout with subtle gradient background
- [x] Add logo/branding header
- [x] Write tests for layout rendering
- [x] Test responsive behavior on mobile

### Task 3.2: Create DashboardLayout Structure
- [ ] Create `resources/js/Layouts/DashboardLayout.tsx`
- [ ] Implement Sidebar with collapsible functionality
- [ ] Implement Header with user menu and notifications
- [ ] Write tests for layout state management
- [ ] Test responsive hamburger menu behavior

### Task 3.3: Create Sidebar Component
- [ ] Create `resources/js/Components/layout/Sidebar.tsx`
- [ ] Add menu items: Dashboard, Aset, ATK, Bahan Kantor, Settings
- [ ] Implement active state highlighting
- [ ] Add icons using lucide-react
- [ ] Write tests for menu navigation
- [ ] Test collapsible behavior

### Task 3.4: Create Header Component
- [ ] Create `resources/js/Components/layout/Header.tsx`
- [ ] Add user avatar with dropdown menu
- [ ] Add notifications bell with MagicUI animation
- [ ] Implement logout functionality
- [ ] Write tests for header interactions

### Task 3.5: Create Mobile Navigation
- [ ] Create `resources/js/Components/layout/MobileNav.tsx`
- [ ] Implement hamburger menu trigger
- [ ] Use Sheet component for drawer
- [ ] Test mobile responsive behavior
- [ ] Write tests for mobile navigation

### Task 3.6: Task: Conductor - User Manual Verification 'Phase 3: Create Layout Components' (Protocol in workflow.md)

---

## Phase 4: Create Authentication Pages [8512abd]

### Task 4.1: Create Login Page Route
- [x] Add Laravel route for `/login` pointing to Inertia render
- [x] Create `resources/js/Pages/Login.tsx`
- [x] Use AuthLayout wrapper
- [x] Write tests for page rendering

### Task 4.2: Create LoginForm Component
- [x] Create `resources/js/Components/auth/LoginForm.tsx` (integrated into login page)
- [x] Implement email input with validation
- [x] Implement password input with show/hide toggle
- [x] Add "Remember me" checkbox
- [x] Add "Forgot password?" link
- [x] Use Inertia `<Form>` component for form handling
- [x] Write tests for form validation
- [x] Test form submission with Fortify endpoint

### Task 4.3: Add Login Page Styling
- [x] Apply gradient background and card styling to login page
- [x] Use blue gradient button for submit button
- [x] Add error alerts using shadcn/alert
- [x] Test all interactive states
- [x] Write tests for error handling

### Task 4.4: Test Authentication Flow
- [x] Write integration test for successful login
- [x] Write integration test for failed login
- [x] Test redirect after successful login
- [x] Test validation errors display correctly
- [x] Run browser test for complete login flow

### Task 4.5: Task: Conductor - User Manual Verification 'Phase 4: Create Authentication Pages' (Protocol in workflow.md)

---

## Phase 5: Create Dashboard

### Task 5.1: Create Dashboard Page Route
- [x] Add Laravel route for `/dashboard` with auth middleware [dfb8568]
- [x] Create `resources/js/Pages/Dashboard.tsx` [dfb8568]
- [x] Use DashboardLayout wrapper [dfb8568]
- [x] Add authentication check [dfb8568]
- [x] Write tests for page access control [dfb8568]

### Task 5.2: Create SummaryCard Component
- [x] Create `resources/js/Components/dashboard/SummaryCard.tsx` [dfb8568]
- [x] Use shadcn/card with hover effects [dfb8568]
- [x] Add icon, title, value, and trend props [dfb8568]
- [x] Implement click navigation [dfb8568]
- [x] Write tests for card interactions [dfb8568]
- [x] Create 4 cards: Total Aset, Total ATK, Permintaan Pending, Aset Rusak [dfb8568]

### Task 5.3: Create StatsChart Component
- [x] Install chart library (recharts) [dfb8568]
- [x] Create `resources/js/Components/dashboard/StatsChart.tsx` [dfb8568]
- [x] Implement line chart for request trends [dfb8568]
- [x] Implement bar chart for asset categories [dfb8568]
- [x] Add mock data for development [dfb8568]
- [x] Write tests for chart rendering [dfb8568]
- [x] Test responsive chart behavior [dfb8568]

### Task 5.4: Create Dashboard Welcome Section
- [x] Add welcome message for user [dfb8568]
- [x] Display user name from auth context [dfb8568]
- [x] Add date/time display with Indonesian locale [dfb8568]
- [x] Write tests for welcome section [dfb8568]

### Task 5.5: Create QuickActions Component
- [x] Create `resources/js/Components/dashboard/QuickActions.tsx` [dfb8568]
- [x] Add buttons for quick navigation to modules [dfb8568]
- [x] Use shadcn button components [dfb8568]
- [x] Implement navigation using anchor tags [dfb8568]
- [x] Write tests for navigation actions [dfb8568]

### Task 5.6: Integrate Dashboard Components
- [x] Assemble all dashboard components in Dashboard.tsx [dfb8568]
- [x] Implement responsive grid layout [dfb8568]
- [x] Test loading states with skeletons [dfb8568]
- [x] Test error handling [dfb8568]
- [x] Write integration tests for complete dashboard [dfb8568]

### Task 5.7: Task: Conductor - User Manual Verification 'Phase 5: Create Dashboard' (Protocol in workflow.md)

---

## Phase 6: State Management & Utilities

### Task 6.1: Create Auth Context
- [ ] Create `resources/js/Hooks/useAuth.ts`
- [ ] Implement auth state management
- [ ] Add user data from page props
- [ ] Add permission check helpers
- [ ] Write tests for auth context

### Task 6.2: Create Utility Functions
- [ ] Add currency formatter (Indonesian Rupiah)
- [ ] Add date formatter (Indonesian locale)
- [ ] Add number formatter
- [ ] Write tests for all formatters
- [ ] Run `vendor/bin/pint --dirty`

### Task 6.3: Create Constants
- [ ] Create `resources/js/Lib/constants.ts`
- [ ] Define app constants (routes, roles, permissions)
- [ ] Export TypeScript types
- [ ] Write tests for constant usage

### Task 6.4: Task: Conductor - User Manual Verification 'Phase 6: State Management & Utilities' (Protocol in workflow.md)

---

## Phase 7: Final Integration & Testing

### Task 7.1: Run Complete Test Suite
- [ ] Execute `npm run test` for all frontend tests
- [ ] Verify coverage >80%
- [ ] Fix any failing tests
- [ ] Run `vendor/bin/pint --dirty`

### Task 7.2: Browser Testing
- [ ] Test login flow in browser
- [ ] Test dashboard rendering
- [ ] Test mobile responsive behavior
- [ ] Test all interactive components
- [ ] Verify animations work smoothly

### Task 7.3: Build Verification
- [ ] Run `npm run build`
- [ ] Verify no build errors
- [ ] Check bundle size
- [ ] Test production build locally

### Task 7.4: Accessibility Check
- [ ] Verify keyboard navigation works
- [ ] Check ARIA labels on all components
- [ ] Test screen reader compatibility
- [ ] Verify color contrast meets WCAG standards

### Task 7.5: Task: Conductor - User Manual Verification 'Phase 7: Final Integration & Testing' (Protocol in workflow.md)
