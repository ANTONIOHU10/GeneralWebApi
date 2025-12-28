// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/employees/employee-settings/employee-settings.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseButtonComponent } from '../../../Shared/components/base/base-button/base-button.component';
import { TranslatePipe } from '@core/pipes/translate.pipe';
import { NotificationService } from '../../../Shared/services/notification.service';
import { TranslationService } from '@core/services/translation.service';

@Component({
  selector: 'app-employee-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseButtonComponent, TranslatePipe],
  templateUrl: './employee-settings.component.html',
  styleUrls: ['./employee-settings.component.scss'],
})
export class EmployeeSettingsComponent {
  private notificationService = inject(NotificationService);
  private translationService = inject(TranslationService);
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
    // 模拟保存成功
    try {
      // TODO: 添加实际的保存API调用
      // await this.settingsService.saveEmployeeSettings(this.settings);
      
      // 显示成功提示
      this.notificationService.success(
        this.translationService.translate('employees.settings.success.title'),
        this.translationService.translate('employees.settings.success.message'),
        {
          duration: 3000,
          autoClose: true,
        }
      );
    } catch (error) {
      // 显示错误提示
      this.notificationService.error(
        this.translationService.translate('employees.settings.errors.saveFailed'),
        this.translationService.translate('employees.settings.errors.saveFailedMessage'),
        {
          duration: 5000,
          persistent: false,
          autoClose: true,
        }
      );
    }
  }
}
