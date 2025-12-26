// Path: GeneralWebApi/Frontend/general-frontend/src/app/Shared/components/header/components/header-brand/header-brand.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-header-brand',
  templateUrl: './header-brand.component.html',
  styleUrls: ['./header-brand.component.scss'],
  imports: [CommonModule],
})
export class HeaderBrandComponent {
  @Input() brandTitle = 'GeneralWebApi';
  @Input() logoText = 'GW';
}

