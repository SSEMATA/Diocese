# Theme System Documentation

## Overview

The application uses CSS custom properties (variables) to support multiple themes. Currently, **two themes** are available:

1. **Default Light Theme** (default)
2. **Dark/Black Theme**

## Color Variables

### Primary Colors
- `--color-primary`: Main primary color
- `--color-primary-dark`: Darker variant for hover/active states
- `--color-primary-light`: Lighter variant for secondary use
- `--color-primary-lighter`: Lightest variant for accents

### Text Colors
- `--color-text-primary`: Primary text (main content)
- `--color-text-secondary`: Secondary text (descriptions, labels)
- `--color-text-muted`: Muted text (less important info)
- `--color-text-lighter`: Light text for backgrounds

### Background Colors
- `--color-bg-primary`: Main background (cards, panels)
- `--color-bg-secondary`: Secondary background (sidebar, sections)
- `--color-bg-tertiary`: Tertiary background (hover states)
- `--color-bg-inverse`: Inverse background (used in dark areas)

### Border Colors
- `--color-border-light`: Light borders
- `--color-border-medium`: Medium borders
- `--color-border-dark`: Dark borders
- `--color-border-darker`: Darkest borders

### Accent Colors
- `--color-blue-50`: Light blue variant
- `--color-blue-100`: Medium blue variant
- `--color-slate-500`: Slate accent color

### Shadow Colors
- `--color-shadow-sm`: Small shadow (0.04 - 0.06 opacity)
- `--color-shadow-md`: Medium shadow (0.06 - 0.08 opacity)
- `--color-shadow-lg`: Large shadow (0.08+ opacity)
- `--color-shadow-primary`: Primary shadow
- `--color-shadow-primary-lg`: Large primary shadow

## Theme Values

### Default Light Theme
| Variable | Value |
|----------|-------|
| --color-primary | #2563eb |
| --color-primary-dark | #1d4ed8 |
| --color-text-primary | #111827 |
| --color-text-secondary | #475569 |
| --color-bg-primary | #ffffff |
| --color-bg-secondary | #f8fafc |
| --color-border-light | #e5e7eb |

### Dark/Black Theme (`.theme-dark`)
| Variable | Value |
|----------|-------|
| --color-primary | #60a5fa |
| --color-primary-dark | #3b82f6 |
| --color-text-primary | #f1f5f9 |
| --color-text-secondary | #cbd5e1 |
| --color-bg-primary | #1e293b |
| --color-bg-secondary | #0f172a |
| --color-border-light | #334155 |

## Implementation

### Default Theme
The default light theme is applied to the `:root` selector. No additional classes needed.

```html
<!-- Default light theme (automatic) -->
<div class="dashboard-app">
  <!-- content uses light theme -->
</div>
```

### Dark Theme
Add the `.theme-dark` class to any parent element to switch to the dark theme.

```html
<!-- Dark theme applied to entire app -->
<div class="dashboard-app theme-dark">
  <!-- All content uses dark theme -->
</div>
```

## Usage Examples

### Switching App-Wide Theme
```jsx
// In React component
const [theme, setTheme] = useState('default');

<div className={`dashboard-app ${theme === 'dark' ? 'theme-dark' : ''}`}>
  {/* App content */}
</div>
```

### Component-Level Theme
You can apply different themes to different parts of the app:

```html
<div class="dashboard-app">
  <!-- Light theme -->
  <header>Light Header</header>
  
  <!-- Dark theme for this section -->
  <section class="theme-dark">
    Dark Content
  </section>
</div>
```

## Adding New Colors

To add a new color variable:

1. Add to `:root` for light theme
2. Add to `.theme-dark` for dark theme
3. Use `var(--color-name)` throughout CSS

Example:
```css
:root {
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
}

.theme-dark {
  --color-success: #34d399;
  --color-warning: #fbbf24;
  --color-error: #f87171;
}
```

## Best Practices

1. **Always use variables** - Never hardcode colors in CSS
2. **Follow naming conventions** - Use the established variable naming patterns
3. **Test both themes** - Ensure components work in both light and dark modes
4. **Consistent hierarchy** - Use primary/secondary/muted consistently
5. **Accessibility** - Ensure sufficient contrast in both themes

## Switching Themes Programmatically

```jsx
function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('theme-dark');
    } else {
      root.classList.add('theme-dark');
    }
    setIsDark(!isDark);
  };

  return (
    <button onClick={toggleTheme}>
      {isDark ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
```

## CSS Variables Location

All theme variables are defined in `src/pages/pages.css` at the top of the file:

- Lines 1-31: Default light theme (`:root`)
- Lines 33-64: Dark theme (`.theme-dark`)

## Future Enhancements

Potential themes to add:
- **High contrast theme** - For accessibility
- **Custom brand theme** - Different primary color
- **Seasonal themes** - Holiday-themed color palettes
