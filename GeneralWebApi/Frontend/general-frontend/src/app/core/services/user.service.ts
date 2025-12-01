import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';
import { ApiResponse } from 'app/contracts/common/api-response';

// User with Employee information - matches backend UserWithEmployeeDto
export interface UserWithEmployee {
  userId: number;
  username: string;
  email: string;
  phoneNumber?: string | null;
  role: string;
  employeeId?: number | null;
  employeeName?: string | null;
  employeeNumber?: string | null;
  departmentName?: string | null;
  positionName?: string | null;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseHttpService {
  private readonly endpoint = `${this.baseUrl}/users`;

  /**
   * Get list of users with employee information
   * @returns Observable of users with employee information
   */
  getUsersWithEmployee(): Observable<UserWithEmployee[]> {
    return this.get<ApiResponse<UserWithEmployee[]>>(
      `${this.endpoint}/with-employee`,
      undefined,
      { extractData: false }
    ).pipe(
      map((response: ApiResponse<UserWithEmployee[]>) => {
        if (!response.data) {
          throw new Error(response.message || 'Response data is missing');
        }
        return response.data;
      })
    );
  }

  /**
   * Get user by ID with employee information
   * @param id User ID
   * @returns Observable of user with employee information
   */
  getUserWithEmployee(id: number): Observable<UserWithEmployee> {
    return this.get<ApiResponse<UserWithEmployee>>(
      `${this.endpoint}/${id}/with-employee`,
      undefined,
      { extractData: false }
    ).pipe(
      map((response: ApiResponse<UserWithEmployee>) => {
        if (!response.data) {
          throw new Error(response.message || 'Response data is missing');
        }
        return response.data;
      })
    );
  }
}





