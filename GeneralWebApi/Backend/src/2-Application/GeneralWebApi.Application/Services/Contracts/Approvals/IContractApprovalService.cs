using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Contracts.Approvals;

namespace GeneralWebApi.Application.Services.Contracts.Approvals;

public interface IContractApprovalService
{
    Task<ContractApprovalDto> SubmitForApprovalAsync(int contractId, string requestedBy, string? comments, CancellationToken cancellationToken = default);
    Task<bool> ApproveAsync(int approvalId, string approverId, string? comments, CancellationToken cancellationToken = default);
    Task<bool> RejectAsync(int approvalId, string approverId, string reason, CancellationToken cancellationToken = default);
    Task<PagedResult<ContractApprovalDto>> GetPendingApprovalsAsync(string approverUserId, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<List<ContractApprovalStepDto>> GetApprovalHistoryAsync(int contractId, CancellationToken cancellationToken = default);
}


