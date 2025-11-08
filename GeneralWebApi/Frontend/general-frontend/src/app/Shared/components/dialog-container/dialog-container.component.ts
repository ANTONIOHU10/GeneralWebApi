// Path: GeneralWebApi/Frontend/general-frontend/src/app/Shared/components/dialog-container/dialog-container.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DialogService, DialogData } from '../../services/dialog.service';
import { BaseConfirmDialogComponent } from '../base/base-confirm-dialog/base-confirm-dialog.component';

@Component({
  selector: 'app-dialog-container',
  standalone: true,
  imports: [CommonModule, BaseConfirmDialogComponent],
  templateUrl: './dialog-container.component.html',
  styleUrls: ['./dialog-container.component.scss'],
})
export class DialogContainerComponent implements OnInit, OnDestroy {
  dialogs: DialogData[] = [];
  private subscription?: Subscription;
  private dialogService = inject(DialogService);

  ngOnInit(): void {
    this.subscription = this.dialogService.dialogs$.subscribe(
      dialogs => (this.dialogs = dialogs)
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onConfirm(dialog: DialogData): void {
    this.dialogService.resolveDialog(dialog.id, true);
  }

  onCancel(dialog: DialogData): void {
    this.dialogService.resolveDialog(dialog.id, false);
  }

  onClose(dialog: DialogData): void {
    this.dialogService.resolveDialog(dialog.id, false);
  }

  trackByDialogId(index: number, dialog: DialogData): string {
    return dialog.id;
  }
}

