// Path: GeneralWebApi/Frontend/general-frontend/src/app/contracts/contract-templates/contract-template.model.ts

export interface ContractTemplate {
  id: number;
  name: string;
  description: string;
  contractType: string;
  templateContent: string;
  variables: string; // JSON string
  category: string | null;
  isActive: boolean;
  isDefault: boolean;
  usageCount: number;
  tags: string | null; // JSON string
  legalRequirements: string | null;
  approvalWorkflow: string | null; // JSON string
  version: number;
  parentTemplateId: number | null;
  createdAt: string;
  updatedAt: string | null;
}

/** Backend list item DTO (ContractTemplateListDto) - camelCase from API */
export interface BackendContractTemplateListDto {
  id: number;
  name: string;
  description: string;
  contractType: string;
  category: string | null;
  isActive: boolean;
  isDefault: boolean;
  usageCount: number;
  version: number;
  createdAt: string;
}

/** Backend full DTO (ContractTemplateDto) - for get-by-id and create response */
export interface BackendContractTemplateDto {
  id: number;
  name: string;
  description: string;
  contractType: string;
  templateContent: string;
  variables: string | null;
  category: string | null;
  isActive: boolean;
  isDefault: boolean;
  usageCount: number;
  tags: string | null;
  legalRequirements: string | null;
  approvalWorkflow: string | null;
  version: number;
  parentTemplateId: number | null;
  createdAt: string;
  updatedAt: string | null;
}

/** Search params for paged list - matches backend ContractTemplateSearchDto */
export interface ContractTemplateSearchParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  contractType?: string;
  category?: string;
  isActive?: boolean;
  isDefault?: boolean;
  sortBy?: string;
  sortDescending?: boolean;
}

/** Paged result from API - matches backend PagedResult<T> */
export interface ContractTemplatePagedResult {
  items: BackendContractTemplateListDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CreateContractTemplateRequest {
  name: string;
  description: string;
  contractType: string;
  templateContent: string;
  variables?: string;
  category?: string;
  isActive?: boolean;
  isDefault?: boolean;
  tags?: string;
  legalRequirements?: string;
  approvalWorkflow?: string;
  parentTemplateId?: number | null;
}

export interface UpdateContractTemplateRequest {
  name?: string;
  description?: string;
  contractType?: string;
  templateContent?: string;
  variables?: string;
  category?: string;
  isActive?: boolean;
  isDefault?: boolean;
  tags?: string;
  legalRequirements?: string;
  approvalWorkflow?: string;
  parentTemplateId?: number | null;
}

export const CONTRACT_TEMPLATE_CATEGORIES = [
  'Employment',
  'Consulting',
  'Service',
  'NDA',
  'Other',
] as const;

export type ContractTemplateCategory = typeof CONTRACT_TEMPLATE_CATEGORIES[number];

