# Internationalization (i18n) Guide

## Overview

This project uses a custom internationalization system that supports multiple languages. The translation files are stored in JSON format in the `assets/i18n/` directory.

## Supported Languages

- **English (en)** - Default language
- **Chinese (zh)** - 中文
- **Spanish (es)** - Español

## File Structure

```
src/assets/i18n/
├── en.json    # English translations
├── zh.json    # Chinese translations
└── es.json    # Spanish translations
```

## Translation Key Structure

Translation keys use dot notation to organize translations hierarchically:

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel"
  },
  "settings": {
    "title": "Settings",
    "language": "Language"
  }
}
```

## Usage in Templates

Use the `translate` pipe in your Angular templates:

```html
<!-- Simple translation -->
<h1>{{ 'common.appName' | translate }}</h1>

<!-- Translation with parameters -->
<p>{{ 'notifications.unreadCount' | translate: {count: 5} }}</p>

<!-- In component properties -->
<app-base-button [text]="'common.save' | translate"></app-base-button>
```

## Usage in TypeScript

Inject `TranslationService` in your component:

```typescript
import { TranslationService } from '@core/services/translation.service';

export class MyComponent {
  private translationService = inject(TranslationService);

  getTitle(): string {
    return this.translationService.translate('common.appName');
  }

  getMessage(count: number): string {
    return this.translationService.translate('notifications.unreadCount', { count });
  }
}
```

## Adding New Translations

1. **Add the key to all language files** (`en.json`, `zh.json`, `es.json`):

```json
{
  "myFeature": {
    "title": "My Feature",
    "description": "This is my feature"
  }
}
```

2. **Use in templates**:

```html
<h2>{{ 'myFeature.title' | translate }}</h2>
<p>{{ 'myFeature.description' | translate }}</p>
```

## Language Switching

Users can change the language in Settings:
1. Open Settings modal
2. Go to "Language & Region" section
3. Select preferred language from dropdown
4. Language changes immediately and is saved to localStorage

## Translation Parameters

Use `{{paramName}}` syntax in translation strings:

```json
{
  "notifications": {
    "unreadCount": "{{count}} unread notifications"
  }
}
```

Then use it with parameters:

```html
{{ 'notifications.unreadCount' | translate: {count: 5} }}
```

## Best Practices

1. **Use descriptive keys**: `settings.darkMode` instead of `darkMode`
2. **Group related translations**: Keep related translations under the same parent key
3. **Keep keys consistent**: Use the same key structure across all language files
4. **Add all languages**: When adding a new key, add it to all language files
5. **Use parameters**: For dynamic content, use parameters instead of string concatenation

## Current Translation Coverage

- ✅ Common UI elements (buttons, labels, actions)
- ✅ Settings panel
- ✅ Notification center
- ✅ Error messages
- ✅ Empty states
- ✅ Time formatting

## Adding a New Language

1. Create a new JSON file: `src/assets/i18n/{languageCode}.json`
2. Copy the structure from `en.json`
3. Translate all values
4. Add the language to `LocaleService.languages` array
5. The language will automatically appear in the language selector

## Notes

- Translations are loaded asynchronously when the app starts
- If a translation key is missing, the key itself is returned as fallback
- Language preference is saved to localStorage and persists across sessions
- The `translate` pipe is impure to react to language changes automatically


