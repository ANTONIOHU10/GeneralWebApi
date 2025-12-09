// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/audit-logs/audit-log-detail/audit-log-detail.component.ts
import { 
  Component, Input, Output, EventEmitter, 
  AfterViewInit, OnChanges, 
  TemplateRef, ViewChild, signal 
} from '@angular/core';
import type { SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BaseDetailComponent,
  DetailSection,
  BadgeVariant,
} from '../../../Shared/components/base';
import { AuditLog } from '../../../audit-logs/audit-log.model';

@Component({
  selector: 'app-audit-log-detail',
  standalone: true,
  imports: [
    CommonModule,
    BaseDetailComponent,
  ],
  templateUrl: './audit-log-detail.component.html',
  styleUrls: ['./audit-log-detail.component.scss'],
})
export class AuditLogDetailComponent implements AfterViewInit, OnChanges {
  @Input() log: AuditLog | null = null;
  @Input() isOpen = false;
  @Output() closeEvent = new EventEmitter<void>();

  @ViewChild('oldValuesTemplate') oldValuesTemplate!: TemplateRef<any>;
  @ViewChild('newValuesTemplate') newValuesTemplate!: TemplateRef<any>;

  sections = signal<DetailSection[]>([]);

  private updateSections(): void {
    if (!this.log) {
      this.sections.set([]);
      return;
    }
    const sections: DetailSection[] = [
      {
        title: 'Basic Information',
        fields: [
          { label: 'Timestamp', value: this.log.timestamp, type: 'date' },
          { label: 'Module', value: this.log.module, type: 'text' },
          { label: 'Action', value: this.log.action, type: 'badge', badgeVariant: this.getActionVariant(this.log.action) },
          { label: 'Severity', value: this.log.severity, type: 'badge', badgeVariant: this.getSeverityVariant(this.log.severity) },
          { label: 'Entity Type', value: this.log.entityType, type: 'text' },
          { label: 'Entity ID', value: this.log.entityId > 0 ? this.log.entityId.toString() : 'N/A', type: 'text' },
          { label: 'User', value: this.formatUserDisplay(this.log.userName, this.log.userId), type: 'text' },
          { label: 'IP Address', value: this.log.ipAddress || 'N/A', type: 'text' },
          ...(this.log.userAgent ? [{ label: 'User Agent', value: this.log.userAgent, type: 'text' as const }] : []),
          ...(this.log.description ? [{ label: 'Description', value: this.log.description, type: 'text' as const }] : []),
        ],
      },
    ];

    // Only show Old Values and New Values sections separately
    // Changes section is removed to avoid duplication
    if (this.log.oldValues && this.oldValuesTemplate) {
      sections.push({
        title: 'Old Values',
        fields: [
          { label: 'Old Values', value: null, type: 'custom' as const, customTemplate: this.oldValuesTemplate },
        ],
      });
    }

    if (this.log.newValues && this.newValuesTemplate) {
      sections.push({
        title: 'New Values',
        fields: [
          { label: 'New Values', value: null, type: 'custom' as const, customTemplate: this.newValuesTemplate },
        ],
      });
    }

    this.sections.set(sections);
  }

  ngAfterViewInit(): void {
    this.updateSections();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Only check if log data changed - updateSections() will handle template availability
    // and only add sections for templates that exist and have corresponding data
    if (changes['log'] && this.log) {
      // Use setTimeout to ensure ViewChild templates are available after change detection
      setTimeout(() => {
        this.updateSections();
      }, 0);
    }
  }

  getSeverityVariant(severity: string): BadgeVariant {
    return severity === 'Critical' ? 'danger' : severity === 'Error' ? 'danger' : severity === 'Warning' ? 'warning' : 'info';
  }

  getActionVariant(action: string): BadgeVariant {
    if (action === 'Delete' || action === 'Reject') return 'danger';
    if (action === 'Create' || action === 'Approve') return 'success';
    if (action === 'Update') return 'warning';
    return 'secondary';
  }

  onClose(): void {
    this.closeEvent.emit();
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  formatJson(jsonString: string | null | undefined): string {
    if (!jsonString) return 'N/A';
    try {
      return JSON.stringify(JSON.parse(jsonString), null, 2);
    } catch {
      return jsonString;
    }
  }

  formatUserDisplay(userName: string, userId: string): string {
    // If userName and userId are the same, just show one
    if (userName === userId) {
      return userName;
    }
    // Otherwise show both
    return `${userName} (${userId})`;
  }
}
