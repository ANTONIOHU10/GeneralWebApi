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

