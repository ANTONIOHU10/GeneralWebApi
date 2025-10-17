// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/employees/employee-settings/employee-settings.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-container">
      <div class="page-header">
        <h2>
          <span class="material-icons">settings</span>
          Employee Settings
        </h2>
        <p>Configure employee management preferences and system settings</p>
      </div>

      <div class="settings-sections">
        <div class="settings-section">
          <h3>General Settings</h3>
          <div class="settings-group">
            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" checked />
                <span class="checkmark"></span>
                Auto-generate employee ID
              </label>
              <p class="setting-description">
                Automatically generate unique employee IDs for new employees
              </p>
            </div>
            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" checked />
                <span class="checkmark"></span>
                Send welcome email
              </label>
              <p class="setting-description">
                Send welcome email to new employees upon creation
              </p>
            </div>
            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" />
                <span class="checkmark"></span>
                Require manager approval
              </label>
              <p class="setting-description">
                Require manager approval for new employee additions
              </p>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3>Notification Settings</h3>
          <div class="settings-group">
            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" checked />
                <span class="checkmark"></span>
                Email notifications
              </label>
              <p class="setting-description">
                Send email notifications for employee events
              </p>
            </div>
            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" checked />
                <span class="checkmark"></span>
                Birthday reminders
              </label>
              <p class="setting-description">
                Send birthday reminders to managers
              </p>
            </div>
            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" />
                <span class="checkmark"></span>
                Contract expiry alerts
              </label>
              <p class="setting-description">
                Alert when employee contracts are about to expire
              </p>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3>Data Management</h3>
          <div class="settings-group">
            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" checked />
                <span class="checkmark"></span>
                Auto-backup employee data
              </label>
              <p class="setting-description">
                Automatically backup employee data daily
              </p>
            </div>
            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" />
                <span class="checkmark"></span>
                Archive inactive employees
              </label>
              <p class="setting-description">
                Move inactive employees to archive after 1 year
              </p>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3>Access Control</h3>
          <div class="settings-group">
            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" checked />
                <span class="checkmark"></span>
                Restrict personal data access
              </label>
              <p class="setting-description">
                Only HR and managers can view personal employee data
              </p>
            </div>
            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" />
                <span class="checkmark"></span>
                Require two-factor authentication
              </label>
              <p class="setting-description">
                Require 2FA for accessing employee data
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="settings-actions">
        <button class="btn btn-secondary">Reset to Default</button>
        <button class="btn btn-primary">Save Settings</button>
      </div>
    </div>
  `,
  styles: [
    `
      .settings-container {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .page-header {
        padding: 2rem 2rem 1rem 2rem;
        border-bottom: 1px solid #e9ecef;
        background: white;
      }

      .page-header h2 {
        margin: 0 0 0.5rem 0;
        color: #333;
        font-size: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .material-icons {
        font-size: 1.5rem;
        color: #ff9800;
      }

      .page-header p {
        margin: 0;
        color: #666;
      }

      .settings-sections {
        flex: 1;
        background: white;
        overflow-y: auto;
      }

      .settings-section {
        padding: 2rem;
        border-bottom: 1px solid #e9ecef;
      }

      .settings-section:last-child {
        border-bottom: none;
      }

      .settings-section h3 {
        margin: 0 0 1.5rem 0;
        color: #495057;
        font-size: 1.2rem;
      }

      .settings-group {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .setting-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .setting-label {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        cursor: pointer;
        font-weight: 500;
        color: #333;
      }

      .setting-label input[type='checkbox'] {
        display: none;
      }

      .checkmark {
        width: 20px;
        height: 20px;
        border: 2px solid #ced4da;
        border-radius: 4px;
        position: relative;
        transition: all 0.2s ease;
      }

      .setting-label input[type='checkbox']:checked + .checkmark {
        background: #007bff;
        border-color: #007bff;
      }

      .setting-label input[type='checkbox']:checked + .checkmark::after {
        content: '✓';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 12px;
        font-weight: bold;
      }

      .setting-description {
        margin: 0;
        color: #666;
        font-size: 0.9rem;
        margin-left: 2rem;
      }

      .settings-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        padding: 1.5rem 2rem;
        background: #f8f9fa;
        border-top: 1px solid #e9ecef;
        margin-top: auto;
      }

      .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-primary {
        background: #007bff;
        color: white;
      }

      .btn-primary:hover {
        background: #0056b3;
      }

      .btn-secondary {
        background: #6c757d;
        color: white;
      }

      .btn-secondary:hover {
        background: #545b62;
      }

      @media (max-width: 768px) {
        .settings-actions {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class EmployeeSettingsComponent {}
