// Path: GeneralWebApi/Frontend/general-frontend/src/app/core/pipes/translate.pipe.ts
import { Pipe, PipeTransform, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { TranslationService, TranslationParams } from '../services/translation.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false, // Make it impure to react to language changes
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private translationService = inject(TranslationService);
  private cdr = inject(ChangeDetectorRef);
  private subscription?: Subscription;
  private lastKey?: string;
  private lastParams?: TranslationParams;
  private lastValue?: string;

  transform(key: string, params?: TranslationParams): string {
    // If key or params changed, update translation
    if (key !== this.lastKey || JSON.stringify(params) !== JSON.stringify(this.lastParams)) {
      this.lastKey = key;
      this.lastParams = params;
      this.updateTranslation();
    }

    return this.lastValue || key;
  }

  private updateTranslation(): void {
    // Unsubscribe from previous subscription
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    // Subscribe to translations loaded state
    this.subscription = this.translationService.getTranslationsLoaded$().subscribe(() => {
      if (this.lastKey) {
        this.lastValue = this.translationService.translate(this.lastKey, this.lastParams);
        this.cdr.markForCheck();
      }
    });

    // Get initial translation
    if (this.lastKey) {
      this.lastValue = this.translationService.translate(this.lastKey, this.lastParams);
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}





