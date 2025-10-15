// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/footer/footer.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [CommonModule],
})
export class FooterComponent {
  @Input() showVersion = true;
  @Input() version = '1.0.0';
  @Input() copyrightText = 'GeneralWebApi';
  @Input() year = new Date().getFullYear();
  @Input() isPublicLayout = false;
}


