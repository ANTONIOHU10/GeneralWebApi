# BasePrivatePageContainer Component

A reusable container component for private pages with consistent layout structure.

## Features

- Page header with title, subtitle, and icon
- Optional tab navigation
- Header actions slot for custom buttons/controls
- Search slot for search functionality
- Content area with proper scrolling
- Responsive design
- Consistent styling with employee-list layout

## Usage

### Basic Usage

```typescript
import { BasePrivatePageContainerComponent } from '@shared/components/base';

@Component({
  template: `
    <app-base-private-page-container
      title="Employee Management"
      subtitle="Manage and view all employees in the system"
      icon="people"
    >
      <!-- Page content here -->
      <div class="employee-grid">
        <!-- Your content -->
      </div>
    </app-base-private-page-container>
  `,
  imports: [BasePrivatePageContainerComponent],
})
export class MyComponent {}
```

### With Tabs

```typescript
import { BasePrivatePageContainerComponent, TabItem } from '@shared/components/base';

@Component({
  template: `
    <app-base-private-page-container
      title="Employee Management"
      subtitle="Manage and view all employees"
      icon="people"
      [showTabs]="true"
      [tabs]="tabs"
      [activeTabId]="activeTabId"
      (tabChange)="onTabChange($event)"
    >
      <div *ngIf="activeTabId === 'list'">
        <!-- List content -->
      </div>
      <div *ngIf="activeTabId === 'add'">
        <!-- Add content -->
      </div>
    </app-base-private-page-container>
  `,
  imports: [BasePrivatePageContainerComponent],
})
export class MyComponent {
  tabs: TabItem[] = [
    { id: 'list', label: 'List', icon: 'list' },
    { id: 'add', label: 'Add', icon: 'person_add' },
  ];
  activeTabId = 'list';

  onTabChange(tabId: string) {
    this.activeTabId = tabId;
  }
}
```

### With Header Actions and Search

```typescript
@Component({
  template: `
    <app-base-private-page-container
      title="Employee Management"
      subtitle="Manage and view all employees"
      icon="people"
    >
      <!-- Search in header -->
      <app-base-search
        slot="search"
        placeholder="Search employees..."
        (searchChange)="onSearch($event)"
      />

      <!-- Actions in header -->
      <app-base-button
        slot="actions"
        label="Add Employee"
        variant="primary"
        (click)="onAdd()"
      />

      <!-- Page content -->
      <div class="employee-grid">
        <!-- Your content -->
      </div>
    </app-base-private-page-container>
  `,
})
export class MyComponent {}
```

## Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `title` | `string` | `''` | Page title |
| `subtitle` | `string` | `''` | Page subtitle/description |
| `icon` | `string` | `''` | Material icon name |
| `tabs` | `TabItem[]` | `[]` | Array of tab items |
| `activeTabId` | `string` | `''` | Active tab ID |
| `showTabs` | `boolean` | `false` | Show tab navigation |
| `showSearch` | `boolean` | `false` | Show search in header (deprecated, use slot instead) |
| `searchPlaceholder` | `string` | `'Search...'` | Search placeholder text |
| `customClass` | `string` | `''` | Custom CSS class |

## Outputs

| Event | Type | Description |
|-------|------|-------------|
| `tabChange` | `EventEmitter<string>` | Emitted when tab changes |
| `searchChange` | `EventEmitter<string>` | Emitted when search value changes |

## Slots

- `[slot=actions]` - Content for header actions area
- `[slot=search]` - Content for search area in header
- Default slot - Main page content

## Styling

The component uses CSS variables from your design system:
- `--bg-surface` - Header background
- `--bg-primary` - Content area background
- `--border-primary` - Border colors
- `--text-primary` - Primary text color
- `--text-secondary` - Secondary text color
- `--color-primary-500` - Icon color

## Migration from employee-list

Replace the manual header/tabs structure with this component:

**Before:**
```html
<div class="employee-list">
  <div class="list-header">...</div>
  <app-base-tabs>...</app-base-tabs>
  <div class="content-area">...</div>
</div>
```

**After:**
```html
<app-base-private-page-container
  title="Employee Management"
  subtitle="Manage and view all employees"
  icon="people"
  [showTabs]="true"
  [tabs]="tabs"
  [activeTabId]="activeTabId"
  (tabChange)="onTabChange($event)"
>
  <app-base-search slot="search" ... />
  
  <!-- Your content -->
</app-base-private-page-container>
```












