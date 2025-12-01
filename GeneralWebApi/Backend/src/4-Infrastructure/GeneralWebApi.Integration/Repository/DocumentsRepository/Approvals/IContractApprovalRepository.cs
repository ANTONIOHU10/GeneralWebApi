using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Documents.Approvals;
using GeneralWebApi.Integration.Repository.Base;

namespace GeneralWebApi.Integration.Repository.DocumentsRepository.Approvals;

public interface IContractApprovalRepository : IBaseRepository<ContractApproval>
{
    Task<ContractApproval?> GetPendingByContractIdAsync(int contractId, CancellationToken cancellationToken = default);
    Task<ContractApproval?> GetByIdWithStepsAsync(int approvalId, CancellationToken cancellationToken = default);
    Task<List<ContractApprovalStep>> GetApprovalStepsAsync(int approvalId, CancellationToken cancellationToken = default);
    Task<List<ContractApproval>> GetByContractIdAsync(int contractId, CancellationToken cancellationToken = default);
    Task<PagedResult<ContractApproval>> GetPendingForApproverAsync(string approverUserId, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<PagedResult<ContractApproval>> GetPendingForApproverAsync(string approverUserId, string[] approverRoles, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
}


