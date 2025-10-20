# Layout Components Usage Guide

## Overview

The layout system provides two main layout components for different application contexts:

- **PrivateLayoutComponent**: For authenticated/private pages with sidebar navigation
- **PublicLayoutComponent**: For public pages (landing, login, etc.)

## Features

### ✅ Completed Features

1. **Complete Layout Styling**
   - Professional header with brand logo and actions
   - Collapsible sidebar with navigation sections
   - Responsive content area
   - Footer with copyright information

2. **Responsive Design**
   - Mobile-first approach
   - Sidebar collapses to overlay on mobile
   - Touch-friendly navigation
   - Adaptive spacing and typography

3. **Theme Support**
   - Light/Dark mode toggle
   - CSS custom properties for theming
   - Smooth transitions between themes
   - System preference detection

4. **Navigation**
   - RouterLink integration
   - Active route highlighting
   - Icon + text navigation items
   - Collapsible sidebar sections

## File Structure

```
src/
├── app/layout/
│   ├── private-layout.component.ts    # Private layout with sidebar
│   └── public-layout.component.ts     # Public layout (simple)
└── styles/
    ├── components/
    │   └── _layout.scss              # Layout-specific styles
    ├── core/
    │   ├── _variable.scss            # Design system variables
    │   ├── _mixin.scss              # Reusable mixins
    │   └── _typography.scss         # Typography styles
    ├── themes/
    │   ├── _light-theme.scss        # Light theme variables
    │   └── _dark-theme.scss         # Dark theme variables
    └── main.scss                    # Main stylesheet
```

## Usage Examples

### Private Layout (Authenticated Pages)

```typescript
// In your routing module
{
  path: 'dashboard',
  component: DashboardComponent,
  // This will use PrivateLayoutComponent
}
```

### Public Layout (Public Pages)

```typescript
// In your routing module
{
  path: 'login',
  component: LoginComponent,
  // This will use PublicLayoutComponent
}
```

## Customization

### Adding Navigation Items

Edit the navigation sections in `private-layout.component.ts`:

```html
<div class="nav-section">
  <div class="nav-title">Your Section</div>
  <ul class="nav-list">
    <li class="nav-item">
      <a routerLink="/your-route" routerLinkActive="active" class="nav-link">
        <span class="nav-icon">🔧</span>
        <span class="nav-text">Your Page</span>
      </a>
    </li>
  </ul>
</div>
```

### Customizing Colors

Update CSS custom properties in theme files:

```scss
// In _light-theme.scss or _dark-theme.scss
:root {
  --color-primary-500: #your-color;
  --bg-primary: #your-bg-color;
  --text-primary: #your-text-color;
}
```

### Adding Custom Actions

Add buttons to the header actions area:

```html
<div class="header-actions">
  <button class="action-button" (click)="yourAction()">
    <span>Your Icon</span>
  </button>
</div>
```

## Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 768px
- **Desktop**: 768px - 1024px
- **Large Desktop**: > 1024px

## Theme Variables

The layout uses CSS custom properties for theming:

- `--bg-primary`, `--bg-secondary`, `--bg-tertiary`
- `--text-primary`, `--text-secondary`, `--text-tertiary`
- `--border-primary`, `--border-secondary`
- `--color-primary-*` (50-900 scale)
- `--shadow-*` (sm, base, md, lg, xl)

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- CSS custom properties (CSS variables)
- ES6+ features for TypeScript components

## Next Steps

1. **Test the layouts** in your application
2. **Customize navigation** items for your specific needs
3. **Add page-specific content** in the content-body area
4. **Extend the theme** with your brand colors
5. **Add animations** for enhanced user experience

## Notes

- All styles are scoped to prevent conflicts
- Layout components are standalone (no NgModule required)
- Theme switching is persistent via localStorage
- Mobile sidebar includes overlay for better UX
- Print styles are optimized for better printing

