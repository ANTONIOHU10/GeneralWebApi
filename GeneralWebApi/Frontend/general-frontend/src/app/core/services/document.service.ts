// Path: GeneralWebApi/Frontend/general-frontend/src/app/core/services/document.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';
import { ApiResponse } from 'app/contracts/common/api-response';
import { environment } from '@environments/environment';
import { throwError } from 'rxjs';

export interface FileUploadResponse {
  fileName: string;
  fileSize: number;
  contentType: string;
  id: number;
  filePath?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentService extends BaseHttpService {
  private readonly endpoint = `${this.baseUrl}/document`;

  /**
   * Upload a file to the server
   * @param file - File to upload
   * @returns Observable with file upload response containing file ID and metadata
   */
  uploadFile(file: File): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    // Use multipart/form-data for file upload
    // Don't use extractData here as we need to handle the response manually
    const url = this.buildUrl(`${this.endpoint}/upload`);
    
    return this.http.post<ApiResponse<FileUploadResponse>>(url, formData).pipe(
      map((response: ApiResponse<FileUploadResponse>) => {
        if (!response.success) {
          throw new Error(response.message || response.error || 'File upload failed');
        }
        if (!response.data) {
          throw new Error('File upload response data is missing');
        }
        return response.data;
      }),
      catchError((error: unknown) => {
        const message = (error as Error)?.message || 'Failed to upload file';
        return throwError(() => new Error(message));
      })
    );
  }

  /**
   * Get file download URL by file ID
   * @param fileId - File ID
   * @returns File download URL
   */
  getFileDownloadUrl(fileId: number): string {
    return `${this.baseUrl}/document/files/download/${fileId}`;
  }

  /**
   * Get file preview URL (same as download URL for images)
   * @param fileId - File ID
   * @returns File preview URL
   */
  getFilePreviewUrl(fileId: number): string {
    return this.getFileDownloadUrl(fileId);
  }
}

