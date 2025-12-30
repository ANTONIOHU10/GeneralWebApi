// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/employees/employee-hierarchy/employee-hierarchy.component.ts
import { Component, inject, Input, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '@core/services/employee.service';
import { EmployeeHierarchy } from 'app/contracts/employees/employee.model';
import { NotificationService } from '../../../Shared/services/notification.service';
import { TranslatePipe } from '@core/pipes/translate.pipe';
import {
  BaseAvatarComponent,
  BaseBadgeComponent,
  BaseButtonComponent,
  BaseLoadingComponent,
  BaseEmptyComponent,
} from '../../../Shared/components/base';

@Component({
  selector: 'app-employee-hierarchy',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    BaseAvatarComponent,
    BaseBadgeComponent,
    BaseButtonComponent,
    BaseLoadingComponent,
    BaseEmptyComponent,
  ],
  templateUrl: './employee-hierarchy.component.html',
  styleUrl: './employee-hierarchy.component.scss',
})
export class EmployeeHierarchyComponent implements OnInit {
  @Input() employeeId!: string;
  @Input() employeeName?: string;

  private employeeService = inject(EmployeeService);
  private notificationService = inject(NotificationService);

  hierarchy = signal<EmployeeHierarchy | null>(null);
  loading = signal(false);
  expandedNodes = signal<Set<number>>(new Set());

  ngOnInit(): void {
    if (this.employeeId) {
      this.loadHierarchy();
    }
  }

  /**
   * Load employee hierarchy
   */
  loadHierarchy(): void {
    this.loading.set(true);
    this.employeeService.getEmployeeHierarchy(this.employeeId).subscribe({
      next: (data) => {
        this.hierarchy.set(data);
        // Expand root node by default
        if (data) {
          this.expandedNodes.set(new Set([data.id]));
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load employee hierarchy:', err);
        this.notificationService.error(
          'Error',
          'Failed to load employee hierarchy'
        );
        this.loading.set(false);
      },
    });
  }

  /**
   * Toggle node expansion
   */
  toggleNode(nodeId: number): void {
    const expanded = new Set(this.expandedNodes());
    if (expanded.has(nodeId)) {
      expanded.delete(nodeId);
    } else {
      expanded.add(nodeId);
    }
    this.expandedNodes.set(expanded);
  }

  /**
   * Check if node is expanded
   */
  isExpanded(nodeId: number): boolean {
    return this.expandedNodes().has(nodeId);
  }

  /**
   * Expand all nodes
   */
  expandAll(): void {
    const allIds = this.getAllNodeIds(this.hierarchy());
    this.expandedNodes.set(new Set(allIds));
  }

  /**
   * Collapse all nodes
   */
  collapseAll(): void {
    const rootId = this.hierarchy()?.id;
    if (rootId) {
      this.expandedNodes.set(new Set([rootId]));
    } else {
      this.expandedNodes.set(new Set());
    }
  }

  /**
   * Get all node IDs recursively
   */
  private getAllNodeIds(node: EmployeeHierarchy | null): number[] {
    if (!node) return [];
    const ids = [node.id];
    if (node.manager) {
      ids.push(...this.getAllNodeIds(node.manager));
    }
    node.subordinates.forEach((sub) => {
      ids.push(...this.getAllNodeIds(sub));
    });
    return ids;
  }

  /**
   * Get status badge variant
   */
  getStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'secondary' {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'terminated':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  /**
   * Get initials for avatar fallback
   */
  getInitials(node: EmployeeHierarchy): string {
    const firstInitial = node.firstName?.charAt(0) || '';
    const lastInitial = node.lastName?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }
}

