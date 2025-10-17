// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/employees/add-employee/add-employee.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="add-employee-container">
      <div class="page-header">
        <h2>
          <span class="material-icons">person_add</span>
          Add New Employee
        </h2>
        <p>Create a new employee record in the system</p>
      </div>

      <div class="form-container">
        <form class="employee-form">
          <div class="form-section">
            <h3>Personal Information</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">First Name *</label>
                <input type="text" id="firstName" name="firstName" class="form-control" required>
              </div>
              <div class="form-group">
                <label for="lastName">Last Name *</label>
                <input type="text" id="lastName" name="lastName" class="form-control" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="email">Email *</label>
                <input type="email" id="email" name="email" class="form-control" required>
              </div>
              <div class="form-group">
                <label for="phone">Phone</label>
                <input type="tel" id="phone" name="phone" class="form-control">
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Work Information</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="department">Department *</label>
                <select id="department" name="department" class="form-control" required>
                  <option value="">Select Department</option>
                  <option value="it">Information Technology</option>
                  <option value="hr">Human Resources</option>
                  <option value="finance">Finance</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>
              <div class="form-group">
                <label for="position">Position *</label>
                <select id="position" name="position" class="form-control" required>
                  <option value="">Select Position</option>
                  <option value="developer">Developer</option>
                  <option value="manager">Manager</option>
                  <option value="analyst">Analyst</option>
                  <option value="specialist">Specialist</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="startDate">Start Date *</label>
                <input type="date" id="startDate" name="startDate" class="form-control" required>
              </div>
              <div class="form-group">
                <label for="salary">Salary</label>
                <input type="number" id="salary" name="salary" class="form-control" step="0.01">
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary">Add Employee</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .add-employee-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .page-header {
      padding: 2rem 2rem 1rem 2rem;
      border-bottom: 1px solid var(--border-primary);
      background: var(--bg-surface);
    }

    .page-header h2 {
      margin: 0 0 0.5rem 0;
      color: var(--text-primary);
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .material-icons {
      font-size: 1.5rem;
      color: #4CAF50;
    }

    .page-header p {
      margin: 0;
      color: var(--text-secondary);
    }

    .form-container {
      flex: 1;
      background: var(--bg-surface);
      overflow: hidden;
    }

    .employee-form {
      padding: 2rem;
      height: 100%;
      overflow-y: auto;
    }

    .form-section {
      margin-bottom: 2rem;
    }

    .form-section h3 {
      margin: 0 0 1rem 0;
      color: var(--text-primary);
      font-size: 1.1rem;
      border-bottom: 2px solid var(--border-primary);
      padding-bottom: 0.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--text-primary);
    }

    .form-control {
      padding: 0.75rem;
      border: 1px solid var(--border-primary);
      border-radius: 4px;
      font-size: 1rem;
      background: var(--input-bg);
      color: var(--text-primary);
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    .form-control:focus {
      outline: 0;
      border-color: var(--border-focus);
      box-shadow: 0 0 0 0.2rem rgba(var(--color-primary-500), 0.1);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-primary);
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
      background: var(--button-bg);
      color: var(--button-text);
    }

    .btn-primary:hover {
      background: var(--color-primary-600);
    }

    .btn-secondary {
      background: var(--text-tertiary);
      color: var(--text-inverse);
    }

    .btn-secondary:hover {
      background: var(--text-secondary);
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AddEmployeeComponent {}
