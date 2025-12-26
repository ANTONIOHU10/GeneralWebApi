// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/employees/employee-settings/employee-settings.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseButtonComponent } from '../../../Shared/components/base/base-button/base-button.component';
import { TranslatePipe } from '@core/pipes/translate.pipe';

@Component({
  selector: 'app-employee-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseButtonComponent, TranslatePipe],
  templateUrl: './employee-settings.component.html',
  styleUrls: ['./employee-settings.component.scss'],
})
export class EmployeeSettingsComponent {
  // 设置数据
  settings = {
    autoGenerateId: true,
    sendWelcomeEmail: true,
    requireManagerApproval: false,
    enableNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    autoBackup: true,
    archiveInactive: false,
    restrictPersonalData: true,
    requireTwoFactor: false,
  };

  // 重置设置
  resetToDefault() {
    this.settings = {
      autoGenerateId: true,
      sendWelcomeEmail: true,
      requireManagerApproval: false,
      enableNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      autoBackup: true,
      archiveInactive: false,
      restrictPersonalData: true,
      requireTwoFactor: false,
    };
    console.log('Settings reset to default');
  }

  // 保存设置
  saveSettings() {
    console.log('Saving settings:', this.settings);
    // 这里添加实际的保存逻辑
  }
}
