# Theme System Integration Guide

## Quick Start

### 1. Add ThemeSwitcher to Your App

Import and add the component to your top-level app component:

```jsx
import ThemeSwitcher from './components/ThemeSwitcher'

function App() {
  return (
    <div className="dashboard-app">
      {/* Add theme switcher to header or sidebar */}
      <header>
        <h1>Fort Portal Diocese</h1>
        <ThemeSwitcher />
      </header>
      
      {/* Rest of app content */}
    </div>
  )
}

export default App
```

### 2. How It Works

- **Automatic theme detection**: Checks `localStorage` for saved preference
- **Persistent theme**: User's choice is saved and restored on page reload
- **Global application**: Theme applies to entire app via CSS custom properties
- **No re-renders needed**: CSS variables update instantly

### 3. Using CSS Variables in New Components

All new CSS should use theme variables:

```css
/* ✅ Good - Uses theme variables */
.my-component {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-medium);
}

.my-component:hover {
  background: var(--color-bg-secondary);
}

/* ❌ Bad - Hardcoded colors */
.my-component {
  background: #ffffff;
  color: #111827;
  border: 1px solid #e2e8f0;
}
```

### 4. Available Color Variables

#### Text Colors
- `var(--color-text-primary)` - Main text
- `var(--color-text-secondary)` - Descriptions
- `var(--color-text-muted)` - Less important
- `var(--color-text-lighter)` - On dark backgrounds

#### Background Colors
- `var(--color-bg-primary)` - Cards, panels
- `var(--color-bg-secondary)` - Sidebar, sections
- `var(--color-bg-tertiary)` - Hover states
- `var(--color-bg-inverse)` - Inverse areas

#### Border & Accent Colors
- `var(--color-border-light)` - Light borders
- `var(--color-border-medium)` - Standard borders
- `var(--color-border-dark)` - Dark borders
- `var(--color-primary)` - Primary action color
- `var(--color-primary-dark)` - Active/hover state

#### Shadows
- `var(--color-shadow-sm)` - Small shadows
- `var(--color-shadow-md)` - Medium shadows
- `var(--color-shadow-lg)` - Large shadows
- `var(--color-shadow-primary)` - Primary color shadow

### 5. Testing Themes

#### Visual Testing
1. Click theme switcher button
2. Watch UI update instantly
3. Refresh page - theme persists

#### Code Testing
```jsx
// Test in browser console
document.documentElement.classList.add('theme-dark')  // Dark mode
document.documentElement.classList.remove('theme-dark') // Light mode
```

### 6. Component Checklist

When building new components, ensure:
- [ ] All colors use `var(--color-*)`
- [ ] No hardcoded hex colors
- [ ] Tested in both light and dark themes
- [ ] Sufficient contrast maintained
- [ ] Shadows use theme shadow variables
- [ ] Border colors are theme-aware

### 7. Current Theme Values

**Light Theme (`:root`)**
```
Primary: #2563eb
Text: #111827
Background: #ffffff
Secondary BG: #f8fafc
Borders: #e2e8f0
```

**Dark Theme (`.theme-dark`)**
```
Primary: #60a5fa
Text: #f1f5f9
Background: #1e293b
Secondary BG: #0f172a
Borders: #475569
```

### 8. Extending the Theme System

To add more colors, edit `src/pages/pages.css`:

```css
:root {
  /* ...existing variables... */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
}

.theme-dark {
  /* ...existing variables... */
  --color-success: #34d399;
  --color-warning: #fbbf24;
  --color-error: #f87171;
}
```

Then use in components:
```css
.success-badge {
  background: var(--color-success);
  color: white;
}
```

## Troubleshooting

### Theme not changing
- Check browser console for errors
- Verify `theme-dark` class is added to root element
- Clear browser cache and localStorage

### Colors look wrong
- Ensure CSS file is using `var(--color-*)`
- Check that variable names match defined colors
- Verify no hardcoded colors override variables

### Components not updating
- CSS custom properties update instantly (no React re-render needed)
- Use browser DevTools to inspect computed styles
- Check CSS specificity - inline styles override variables

## Related Files

- **Theme variables**: `src/pages/pages.css` (lines 1-64)
- **Theme switcher**: `src/components/ThemeSwitcher.jsx`
- **Theme styles**: `src/components/ThemeSwitcher.css`
- **Documentation**: `THEME_SYSTEM.md`
