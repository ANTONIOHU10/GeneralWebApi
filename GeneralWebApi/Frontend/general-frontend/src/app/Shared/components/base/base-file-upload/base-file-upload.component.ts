// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-file-upload/base-file-upload.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

export interface FileData {
  name: string;
  size: number;
  type: string;
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
}

@Component({
  selector: 'app-base-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-file-upload.component.html',
  styleUrls: ['./base-file-upload.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BaseFileUploadComponent),
      multi: true,
    },
  ],
})
export class BaseFileUploadComponent implements ControlValueAccessor {
  @Input() accept = '';
  @Input() multiple = false;
  @Input() disabled = false;
  @Input() placeholder = '';
  @Input() showRemoveButton = true;
  @Input() hint = '';
  @Input() error = '';
  @Input() customClass = '';
  @Input() uploadId = `upload-${Math.random().toString(36).slice(2, 11)}`;

  @Output() filesChange = new EventEmitter<FileData[]>();
  @Output() fileSelect = new EventEmitter<File>();

  files: FileData[] = [];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onChange = (_value: FileData[]) => {
    // ControlValueAccessor implementation
  };
  private onTouched = () => {
    // ControlValueAccessor implementation
  };

  get wrapperClass(): string {
    const classes = ['file-upload-wrapper', this.customClass].filter(Boolean);
    return classes.join(' ');
  }

  get containerClass(): string {
    const classes = ['file-upload-container'];
    if (this.disabled) classes.push('disabled');
    return classes.join(' ');
  }

  onFileChange(event: Event): void {
    if (this.disabled) return;

    const target = event.target as HTMLInputElement;
    const selectedFiles = target.files;

    if (!selectedFiles || selectedFiles.length === 0) return;

    for (const file of Array.from(selectedFiles)) {
      const fileData: FileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        status: 'pending',
      };

      this.files.push(fileData);
      this.fileSelect.emit(file);
    }

    this.onChange(this.files);
    this.filesChange.emit(this.files);
    this.onTouched();
  }

  removeFile(index: number): void {
    if (this.disabled) return;

    this.files.splice(index, 1);
    this.onChange(this.files);
    this.filesChange.emit(this.files);
  }

  getFileIcon(type: string): string {
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video_file';
    if (type.startsWith('audio/')) return 'audiotrack';
    if (type.includes('pdf')) return 'picture_as_pdf';
    if (type.includes('word')) return 'description';
    if (type.includes('excel')) return 'table_chart';
    return 'insert_drive_file';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  onFocus(): void {
    // Handle focus event if needed
  }

  onBlur(): void {
    this.onTouched();
  }

  // ControlValueAccessor implementation
  writeValue(value: FileData[]): void {
    this.files = value || [];
  }

  registerOnChange(fn: (value: FileData[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

