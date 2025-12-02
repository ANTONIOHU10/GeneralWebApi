import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from './base-http.service';

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
    return this.get<UserWithEmployee[]>(`${this.endpoint}/with-employee`);
  }

  /**
   * Get user by ID with employee information
   * @param id User ID
   * @returns Observable of user with employee information
   */
  getUserWithEmployee(id: number): Observable<UserWithEmployee> {
    return this.get<UserWithEmployee>(`${this.endpoint}/${id}/with-employee`);
  }

  /**
   * Create new user
   * @param userData User creation data
   * @returns Observable of created user with employee information
   */
  createUser(userData: {
    username: string;
    email: string;
    password: string;
    phoneNumber?: string;
    role: string;
    firstName?: string;
    lastName?: string;
    departmentId?: number;
    positionId?: number;
  }): Observable<UserWithEmployee> {
    return this.post<UserWithEmployee>(this.endpoint, userData);
  }

  /**
   * Update user
   * @param id User ID
   * @param userData User update data
   * @returns Observable of updated user with employee information
   */
  updateUser(id: number, userData: {
    username?: string;
    email?: string;
    phoneNumber?: string;
    role?: string;
    firstName?: string;
    lastName?: string;
    departmentId?: number;
    positionId?: number;
  }): Observable<UserWithEmployee> {
    return this.put<UserWithEmployee>(`${this.endpoint}/${id}`, userData);
  }

  /**
   * Delete user
   * @param id User ID
   * @returns Observable of deletion result
   */
  deleteUser(id: number): Observable<boolean> {
    return this.delete<boolean>(`${this.endpoint}/${id}`);
  }
}





