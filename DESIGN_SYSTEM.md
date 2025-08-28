# Collab Core Design System & Coding Rules

## Table of Contents
- [General Principles](#general-principles)
- [Component Rules](#component-rules)
- [UI/UX Standards](#uiux-standards)
- [Code Conventions](#code-conventions)
- [File Organization](#file-organization)
- [Performance Guidelines](#performance-guidelines)

## General Principles

### 1. Consistency First
- All components should follow the same patterns and conventions
- Use established shadcn/ui components as the foundation
- Maintain consistent naming conventions across the project

### 2. Accessibility (a11y)
- All interactive elements must be keyboard accessible
- Proper ARIA labels and roles required
- Color contrast must meet WCAG AA standards
- Screen reader compatibility is mandatory

### 3. Performance
- Lazy load components when possible
- Minimize bundle size through tree shaking
- Optimize re-renders with proper memoization

## Component Rules

### Buttons
**MANDATORY RULES:**
1. **Cursor Pointer:** All buttons MUST have `cursor-pointer` class or inherit pointer cursor
2. **Base Component:** Always use `@/components/ui/button` as the foundation
3. **Loading States:** Interactive buttons must show loading state during async operations
4. **Disabled States:** Buttons must have proper disabled styling and behavior

```tsx
// ✅ CORRECT - Using shadcn Button with proper cursor
import { Button } from "@/components/ui/button"

<Button className="cursor-pointer" onClick={handleClick}>
  Click Me
</Button>

// ✅ CORRECT - AnimatedButton wrapper (already has cursor styling)
import { AnimatedButton } from "@/components/dashboard/AnimatedButton"

<AnimatedButton icon={PlusIcon} text="Add New" />

// ❌ INCORRECT - Missing cursor pointer
<button className="bg-primary text-white px-4 py-2">
  Click Me
</button>
```

### Toggle/Switch Components
**MANDATORY RULES:**
1. **Standard Component:** ALWAYS use `@/components/dashboard/SwitchButton` for toggles
2. **No Custom Toggles:** Do not create custom toggle components
3. **Consistent Behavior:** All toggles must handle controlled/uncontrolled states
4. **Event Propagation:** Must prevent event propagation when inside clickable containers

```tsx
// ✅ CORRECT - Using standard SwitchButton
import SwitchButton from "@/components/dashboard/SwitchButton"

<SwitchButton
  checked={isActive}
  onChange={setIsActive}
  label="Enable feature"
/>

// ❌ INCORRECT - Custom toggle implementation
<div className="toggle-custom">
  <input type="checkbox" />
</div>
```

### Form Components
**MANDATORY RULES:**
1. **shadcn Form:** Always use `@/components/ui/form` for form handling
2. **Validation:** Use Zod for schema validation
3. **Error Handling:** Consistent error message display with `FormMessage`
4. **Loading States:** Form submissions must show loading indicators

```tsx
// ✅ CORRECT - Standard form pattern
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const formSchema = z.object({
  name: z.string().min(2, "Name is required")
})

const form = useForm({
  resolver: zodResolver(formSchema)
})
```

### Date Inputs
**MANDATORY RULES:**
1. **DatePicker Only:** Use shadcn DatePicker (Popover + Calendar) for all date inputs
2. **No HTML Date Inputs:** Never use `<input type="date">`
3. **Consistent Formatting:** Use `date-fns` for date formatting
4. **Validation:** Disable past dates where appropriate

```tsx
// ✅ CORRECT - Using DatePicker
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">
      {date ? format(date, "PPP") : "Pick a date"}
    </Button>
  </PopoverTrigger>
  <PopoverContent>
    <Calendar mode="single" selected={date} onSelect={setDate} />
  </PopoverContent>
</Popover>

// ❌ INCORRECT - HTML date input
<input type="date" value={date} onChange={handleChange} />
```

### Modal/Dialog Components
**MANDATORY RULES:**
1. **Drawer for Mobile:** Use `@/components/ui/drawer` for mobile-optimized modals
2. **Dialog for Desktop:** Use `@/components/ui/dialog` for desktop modals
3. **Consistent Structure:** Always include header, content, and footer sections
4. **Close Behavior:** Implement proper close handlers with state cleanup

### Cards
**MANDATORY RULES:**
1. **shadcn Card Base:** Always extend `@/components/ui/card`
2. **Hover Effects:** Interactive cards must have hover states
3. **Consistent Padding:** Use standard spacing classes (p-4, p-6)
4. **Loading States:** Show skeleton loading for async content

## UI/UX Standards

### Colors & Theming
- Use CSS variables defined in `globals.css`
- Support both light and dark modes
- Maintain consistent color semantics (primary, secondary, destructive, etc.)

### Typography
- Use Tailwind typography classes consistently
- Maintain text hierarchy with proper heading levels
- Ensure proper line-height and letter-spacing

### Spacing
- Use Tailwind's spacing scale consistently
- Follow 4px/8px grid system
- Maintain consistent margins and paddings

### Animation & Transitions
- Use `transition-all` or specific transition properties
- Keep animations subtle and purposeful
- Use consistent duration (200ms, 300ms for longer animations)

## Code Conventions

### Import Organization
```tsx
// 1. React imports
import React, { useState, useEffect } from "react"

// 2. Third-party libraries
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

// 3. UI components (alphabetical)
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// 4. Custom components
import { AnimatedButton } from "@/components/dashboard/AnimatedButton"

// 5. Utilities and hooks
import { cn } from "@/lib/utils"
import { useUsers } from "@/lib/hooks/useUsers"

// 6. Types
import type { User } from "@/types/user"
```

### Component Structure
```tsx
// 1. Types and interfaces
interface ComponentProps {
  title: string
  onAction?: () => void
}

// 2. Component definition
export default function Component({ title, onAction }: ComponentProps) {
  // 3. State
  const [isLoading, setIsLoading] = useState(false)
  
  // 4. Hooks
  const { data, error } = useQuery(...)
  
  // 5. Event handlers
  const handleClick = () => {
    // implementation
  }
  
  // 6. Render helpers (if needed)
  const renderContent = () => {
    // implementation
  }
  
  // 7. Return JSX
  return (
    <div>
      {/* content */}
    </div>
  )
}
```

### Naming Conventions
- **Components:** PascalCase (`UserProfile`, `AddNewProject`)
- **Files:** PascalCase for components, kebab-case for utilities
- **Variables:** camelCase (`isLoading`, `handleClick`)
- **Constants:** UPPER_SNAKE_CASE (`API_BASE_URL`)
- **CSS Classes:** Use Tailwind utilities, avoid custom CSS

### TypeScript Rules
- Always define proper interfaces for props
- Use strict TypeScript configuration
- Prefer type unions over enums when possible
- Use proper generic types for API responses

## File Organization

### Directory Structure
```
components/
├── ui/                    # shadcn/ui base components
├── dashboard/             # Dashboard-specific components
├── forms/                 # Form components
└── common/               # Shared components

lib/
├── hooks/                # Custom hooks
├── api/                  # API utilities
├── utils.ts              # Utility functions
└── constants.ts          # App constants

types/
├── user.d.ts            # User-related types
├── project.d.ts         # Project-related types
└── api.d.ts             # API response types
```

### Component Files
- One component per file
- Export as default
- Include proper TypeScript types
- Add JSDoc comments for complex components

## Performance Guidelines

### State Management
- Use local state for component-specific data
- Use Zustand stores for global state
- Implement proper state cleanup in useEffect

### API Calls
- Use React Query for data fetching
- Implement proper error handling
- Show loading states for async operations
- Cache API responses appropriately

### Bundle Optimization
- Use dynamic imports for large components
- Tree-shake unused utilities
- Optimize images with Next.js Image component

## Enforcement

### Pre-commit Hooks
- ESLint for code quality
- Prettier for code formatting
- TypeScript compilation check
- Test execution

### Code Review Checklist
- [ ] Follows component rules (Button cursor, Switch usage, etc.)
- [ ] Proper TypeScript types
- [ ] Accessibility compliance
- [ ] Consistent styling patterns
- [ ] Error handling implemented
- [ ] Loading states included
- [ ] Mobile responsive design

### Tools
- ESLint with custom rules for component enforcement
- Prettier for consistent formatting
- TypeScript strict mode
- Accessibility testing tools

---

**Note:** This design system is a living document. Updates should be discussed and approved by the development team before implementation.