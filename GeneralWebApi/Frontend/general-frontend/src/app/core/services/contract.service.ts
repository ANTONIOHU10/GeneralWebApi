// Path: GeneralWebApi/Frontend/general-frontend/src/app/core/services/contract.service.ts
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseHttpService } from './base-http.service';
import {
  Contract,
  BackendContract,
  PagedResult,
  CreateContractRequest,
  UpdateContractRequest,
} from 'app/contracts/contracts/contract.model';
import { ApiResponse } from 'app/contracts/common/api-response';

@Injectable({
  providedIn: 'root',
})
export class ContractService extends BaseHttpService {
  private readonly endpoint = `${this.baseUrl}/contracts`;

  // Transform backend data format to frontend format
  private transformBackendContract(backendContract: BackendContract): Contract {
    return {
      id: backendContract.id.toString(),
      employeeId: backendContract.employeeId,
      employeeName: backendContract.employeeName || null,
      contractType: backendContract.contractType,
      startDate: backendContract.startDate,
      endDate: backendContract.endDate || null,
      status: backendContract.status,
      salary: backendContract.salary || null,
      notes: backendContract.notes,
      renewalReminderDate: backendContract.renewalReminderDate || null,
      createdAt: backendContract.createdAt,
      updatedAt: backendContract.updatedAt || null,
    };
  }

  // Get paginated list of contracts
  getContracts(params?: {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    employeeId?: number;
    contractType?: string;
    status?: string;
    sortBy?: string;
    sortDescending?: boolean;
  }): Observable<ApiResponse<Contract[]>> {
    return this.get<ApiResponse<PagedResult<BackendContract>>>(
      this.endpoint,
      params,
      { extractData: false } // Don't extract data, need to handle pagination
    ).pipe(
      map((response: ApiResponse<PagedResult<BackendContract>>) => {
        if (!response.data) {
          throw new Error(response.message || 'Response data is missing');
        }
        return {
          ...response,
          data: response.data.items.map((item: BackendContract) =>
            this.transformBackendContract(item)
          ),
          pagination: {
            totalItems: response.data.totalCount,
            currentPage: response.data.pageNumber,
            pageSize: response.data.pageSize,
            totalPages: response.data.totalPages,
          },
        };
      })
    );
  }

  // Get contract by ID
  getContractById(id: string): Observable<Contract> {
    return this.get<BackendContract>(`${this.endpoint}/${id}`).pipe(
      map(backendContract => this.transformBackendContract(backendContract))
    );
  }

  // Get contracts by employee ID
  getContractsByEmployee(employeeId: number): Observable<Contract[]> {
    return this.get<BackendContract[]>(`${this.endpoint}/employee/${employeeId}`).pipe(
      map(backendContracts => backendContracts.map(contract => this.transformBackendContract(contract)))
    );
  }

  // Create new contract
  createContract(contract: CreateContractRequest): Observable<Contract> {
    return this.post<BackendContract>(this.endpoint, contract).pipe(
      map(backendContract => this.transformBackendContract(backendContract))
    );
  }

  // Update contract
  updateContract(contract: UpdateContractRequest): Observable<Contract> {
    return this.put<BackendContract>(`${this.endpoint}/${contract.Id}`, contract).pipe(
      map(backendContract => this.transformBackendContract(backendContract))
    );
  }

  // Delete contract
  deleteContract(id: string): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }

  // Get expiring contracts
  getExpiringContracts(daysFromNow = 30): Observable<Contract[]> {
    const params = { daysFromNow };
    return this.get<BackendContract[]>(`${this.endpoint}/expiring`, params).pipe(
      map(backendContracts => backendContracts.map(contract => this.transformBackendContract(contract)))
    );
  }

  // Get expired contracts
  getExpiredContracts(): Observable<Contract[]> {
    return this.get<BackendContract[]>(`${this.endpoint}/expired`).pipe(
      map(backendContracts => backendContracts.map(contract => this.transformBackendContract(contract)))
    );
  }

  // Get contracts by status
  getContractsByStatus(status: string): Observable<Contract[]> {
    return this.get<BackendContract[]>(`${this.endpoint}/status/${status}`).pipe(
      map(backendContracts => backendContracts.map(contract => this.transformBackendContract(contract)))
    );
  }
}

