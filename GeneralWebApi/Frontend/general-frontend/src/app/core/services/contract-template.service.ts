// Path: GeneralWebApi/Frontend/general-frontend/src/app/core/services/contract-template.service.ts
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseHttpService } from './base-http.service';
import { ApiResponse } from 'app/contracts/common/api-response';
import {
  ContractTemplate,
  CreateContractTemplateRequest,
  BackendContractTemplateListDto,
  BackendContractTemplateDto,
  ContractTemplateSearchParams,
  ContractTemplatePagedResult,
} from 'app/contracts/contract-templates/contract-template.model';

@Injectable({
  providedIn: 'root',
})
export class ContractTemplateService extends BaseHttpService {
  private readonly endpoint = `${this.baseUrl}/contract-templates`;

  /** Map backend list item to frontend ContractTemplate (list view - missing full content) */
  private mapListItemToTemplate(dto: BackendContractTemplateListDto): ContractTemplate {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description ?? '',
      contractType: dto.contractType,
      templateContent: '',
      variables: '{}',
      category: dto.category ?? null,
      isActive: dto.isActive,
      isDefault: dto.isDefault,
      usageCount: dto.usageCount,
      tags: null,
      legalRequirements: null,
      approvalWorkflow: null,
      version: dto.version,
      parentTemplateId: null,
      createdAt: dto.createdAt,
      updatedAt: null,
    };
  }

  /** Map backend full DTO to frontend ContractTemplate */
  private mapFullToTemplate(dto: BackendContractTemplateDto): ContractTemplate {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description ?? '',
      contractType: dto.contractType,
      templateContent: dto.templateContent ?? '',
      variables: dto.variables ?? '{}',
      category: dto.category ?? null,
      isActive: dto.isActive,
      isDefault: dto.isDefault,
      usageCount: dto.usageCount,
      tags: dto.tags ?? null,
      legalRequirements: dto.legalRequirements ?? null,
      approvalWorkflow: dto.approvalWorkflow ?? null,
      version: dto.version,
      parentTemplateId: dto.parentTemplateId ?? null,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt ?? null,
    };
  }

  /**
   * Get paged contract templates (list/search).
   * Returns items plus pagination info; maps list DTOs to ContractTemplate (list view).
   */
  getContractTemplates(
    params?: ContractTemplateSearchParams
  ): Observable<{ items: ContractTemplate[]; totalCount: number; pageNumber: number; pageSize: number; totalPages: number }> {
    const queryParams: Record<string, unknown> = {
      pageNumber: params?.pageNumber ?? 1,
      pageSize: params?.pageSize ?? 10,
      searchTerm: params?.searchTerm ?? undefined,
      contractType: params?.contractType ?? undefined,
      category: params?.category ?? undefined,
      isActive: params?.isActive ?? undefined,
      isDefault: params?.isDefault ?? undefined,
      sortBy: params?.sortBy ?? 'createdAt',
      sortDescending: params?.sortDescending ?? true,
    };

    return this.get<ApiResponse<ContractTemplatePagedResult>>(
      this.endpoint,
      queryParams,
      { extractData: false }
    ).pipe(
      map((response: ApiResponse<ContractTemplatePagedResult>) => {
        if (!response.data) {
          throw new Error(response.message || 'Response data is missing');
        }
        const data = response.data;
        return {
          items: data.items.map((item) => this.mapListItemToTemplate(item)),
          totalCount: data.totalCount,
          pageNumber: data.pageNumber,
          pageSize: data.pageSize,
          totalPages: data.totalPages,
        };
      })
    );
  }

  /** Get a single contract template by id (full detail for view/edit). */
  getContractTemplateById(id: number): Observable<ContractTemplate> {
    return this.get<BackendContractTemplateDto>(`${this.endpoint}/${id}`).pipe(
      map((dto) => this.mapFullToTemplate(dto))
    );
  }

  /** Create a new contract template. */
  createContractTemplate(request: CreateContractTemplateRequest): Observable<ContractTemplate> {
    const body = {
      name: request.name,
      description: request.description ?? '',
      contractType: request.contractType,
      templateContent: request.templateContent,
      variables: request.variables ?? null,
      category: request.category ?? null,
      isActive: request.isActive ?? true,
      isDefault: request.isDefault ?? false,
      tags: request.tags ?? null,
      legalRequirements: request.legalRequirements ?? null,
      approvalWorkflow: request.approvalWorkflow ?? null,
      parentTemplateId: request.parentTemplateId ?? null,
    };
    return this.post<BackendContractTemplateDto>(this.endpoint, body).pipe(
      map((dto) => this.mapFullToTemplate(dto))
    );
  }
}
