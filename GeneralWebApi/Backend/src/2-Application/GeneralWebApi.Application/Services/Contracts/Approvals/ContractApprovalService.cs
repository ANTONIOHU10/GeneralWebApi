using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Documents.Approvals;
using GeneralWebApi.DTOs.Contracts.Approvals;
using GeneralWebApi.Integration.Repository.DocumentsRepository;
using GeneralWebApi.Integration.Repository.DocumentsRepository.Approvals;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Application.Services.Contracts.Approvals;

public class ContractApprovalService : IContractApprovalService
{
    private readonly IContractRepository _contractRepository;
    private readonly IContractApprovalRepository _approvalRepository;
    private readonly ILogger<ContractApprovalService> _logger;

    public ContractApprovalService(
        IContractRepository contractRepository,
        IContractApprovalRepository approvalRepository,
        ILogger<ContractApprovalService> logger)
    {
        _contractRepository = contractRepository ?? throw new ArgumentNullException(nameof(contractRepository));
        _approvalRepository = approvalRepository ?? throw new ArgumentNullException(nameof(approvalRepository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<ContractApprovalDto> SubmitForApprovalAsync(int contractId, string requestedBy, string? comments, List<ApprovalStepRequest>? customSteps = null, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Submitting contract {ContractId} for approval by {RequestedBy}", contractId, requestedBy);

        var contract = await _contractRepository.GetByIdAsync(contractId, cancellationToken);
        if (contract == null)
        {
            _logger.LogWarning("Contract with ID {ContractId} not found", contractId);
            throw new KeyNotFoundException($"Contract with ID {contractId} not found");
        }

        var existing = await _approvalRepository.GetPendingByContractIdAsync(contractId, cancellationToken);
        if (existing != null)
        {
            _logger.LogWarning("Contract {ContractId} already has pending approval", contractId);
            throw new InvalidOperationException("Contract already has pending approval");
        }

        var approval = new ContractApproval
        {
            ContractId = contractId,
            Status = "Pending",
            Comments = comments,
            RequestedBy = requestedBy,
            RequestedAt = DateTime.UtcNow,
            CurrentApprovalLevel = 1
        };

        // Use custom steps if provided, otherwise use default two-level workflow
        if (customSteps != null && customSteps.Any())
        {
            approval.MaxApprovalLevel = customSteps.Count;
            foreach (var step in customSteps.OrderBy(s => s.StepOrder))
            {
                approval.ApprovalSteps.Add(new ContractApprovalStep
                {
                    StepOrder = step.StepOrder,
                    StepName = step.StepName,
                    ApproverRole = step.ApproverRole ?? string.Empty,
                    ApproverUserId = step.ApproverUserId,
                    ApproverUserName = step.ApproverUserName,
                    Status = "Pending"
                });
            }
        }
        else
        {
            // Default two-level workflow
            approval.MaxApprovalLevel = 2;
            approval.ApprovalSteps.Add(new ContractApprovalStep
            {
                StepOrder = 1,
                StepName = "Department Manager Approval",
                ApproverRole = "DepartmentManager",
                Status = "Pending"
            });

            approval.ApprovalSteps.Add(new ContractApprovalStep
            {
                StepOrder = 2,
                StepName = "HR Approval",
                ApproverRole = "HRManager",
                Status = "Pending"
            });
        }

        // Update contract status to Pending when submitted for approval
        contract.Status = "Pending";
        await _contractRepository.UpdateAsync(contract, cancellationToken);
        _logger.LogInformation("Contract {ContractId} status updated to Pending when submitted for approval", contractId);

        var saved = await _approvalRepository.AddAsync(approval, cancellationToken);

        _logger.LogInformation("Successfully submitted contract {ContractId} for approval with approval ID {ApprovalId}", contractId, saved.Id);

        // Reload with Contract and Employee to get EmployeeId
        var savedWithContract = await _approvalRepository.GetByIdWithStepsAsync(saved.Id, cancellationToken);

        return new ContractApprovalDto
        {
            Id = savedWithContract.Id,
            ContractId = savedWithContract.ContractId,
            EmployeeId = savedWithContract.Contract?.EmployeeId ?? 0,
            Status = savedWithContract.Status,
            Comments = savedWithContract.Comments,
            RequestedBy = savedWithContract.RequestedBy,
            RequestedAt = savedWithContract.RequestedAt,
            CurrentApprovalLevel = savedWithContract.CurrentApprovalLevel,
            MaxApprovalLevel = savedWithContract.MaxApprovalLevel,
            ApprovalSteps = savedWithContract.ApprovalSteps.Select(s => new ContractApprovalStepDto
            {
                Id = s.Id,
                StepOrder = s.StepOrder,
                StepName = s.StepName,
                ApproverRole = s.ApproverRole,
                ApproverUserId = s.ApproverUserId,
                ApproverUserName = s.ApproverUserName,
                Status = s.Status,
                Comments = s.Comments,
                ProcessedAt = s.ProcessedAt,
                ProcessedBy = s.ProcessedBy,
                DueDate = s.DueDate
            }).OrderBy(s => s.StepOrder).ToList()
        };
    }

    public async Task<bool> ApproveAsync(int approvalId, string approverId, string? comments, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Approving approval {ApprovalId} by {ApproverId}", approvalId, approverId);

        var approval = await _approvalRepository.GetByIdWithStepsAsync(approvalId, cancellationToken);
        if (approval == null)
        {
            _logger.LogWarning("Approval with ID {ApprovalId} not found", approvalId);
            throw new KeyNotFoundException($"Approval with ID {approvalId} not found");
        }

        var current = approval.ApprovalSteps.FirstOrDefault(s => s.StepOrder == approval.CurrentApprovalLevel && s.Status == "Pending");
        if (current == null)
        {
            _logger.LogWarning("No pending step found for approval {ApprovalId}", approvalId);
            throw new InvalidOperationException("No pending step found for approval");
        }

        // Verify that the approver is authorized for this step
        // If ApproverUserId is specified, only that user can approve
        if (!string.IsNullOrEmpty(current.ApproverUserId) && current.ApproverUserId != approverId)
        {
            _logger.LogWarning("User {ApproverId} is not authorized to approve step {StepOrder} of approval {ApprovalId}. Expected approver: {ExpectedApproverId}", 
                approverId, current.StepOrder, approvalId, current.ApproverUserId);
            throw new UnauthorizedAccessException($"You are not authorized to approve this step. Expected approver: {current.ApproverUserName ?? current.ApproverUserId}");
        }

        current.Status = "Approved";
        current.Comments = comments;
        current.ProcessedAt = DateTime.UtcNow;
        current.ProcessedBy = approverId;

        if (approval.CurrentApprovalLevel < approval.MaxApprovalLevel)
        {
            approval.CurrentApprovalLevel++;
            _logger.LogInformation("Approval {ApprovalId} moved to level {Level}", approvalId, approval.CurrentApprovalLevel);
        }
        else
        {
            approval.Status = "Approved";
            approval.ApprovedBy = approverId;
            approval.ApprovedAt = DateTime.UtcNow;
            _logger.LogInformation("Approval {ApprovalId} completed", approvalId);

            // Update contract status to Active when approval is completed
            var contract = await _contractRepository.GetByIdAsync(approval.ContractId, cancellationToken);
            if (contract != null)
            {
                contract.Status = "Active";
                await _contractRepository.UpdateAsync(contract, cancellationToken);
                _logger.LogInformation("Contract {ContractId} status updated to Active after approval", contract.Id);
            }
        }

        await _approvalRepository.UpdateAsync(approval, cancellationToken);
        return true;
    }

    public async Task<bool> RejectAsync(int approvalId, string approverId, string reason, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Rejecting approval {ApprovalId} by {ApproverId}", approvalId, approverId);

        var approval = await _approvalRepository.GetByIdWithStepsAsync(approvalId, cancellationToken);
        if (approval == null)
        {
            _logger.LogWarning("Approval with ID {ApprovalId} not found", approvalId);
            throw new KeyNotFoundException($"Approval with ID {approvalId} not found");
        }

        approval.Status = "Rejected";
        approval.RejectedBy = approverId;
        approval.RejectedAt = DateTime.UtcNow;
        approval.RejectionReason = reason;

        var current = approval.ApprovalSteps.FirstOrDefault(s => s.StepOrder == approval.CurrentApprovalLevel && s.Status == "Pending");
        if (current != null)
        {
            current.Status = "Rejected";
            current.Comments = reason;
            current.ProcessedAt = DateTime.UtcNow;
            current.ProcessedBy = approverId;
        }

        // Update contract status to Pending when approval is rejected
        var contract = await _contractRepository.GetByIdAsync(approval.ContractId, cancellationToken);
        if (contract != null)
        {
            contract.Status = "Pending";
            await _contractRepository.UpdateAsync(contract, cancellationToken);
            _logger.LogInformation("Contract {ContractId} status updated to Pending after rejection", contract.Id);
        }

        await _approvalRepository.UpdateAsync(approval, cancellationToken);
        _logger.LogInformation("Approval {ApprovalId} rejected", approvalId);
        return true;
    }

    public async Task<PagedResult<ContractApprovalDto>> GetPendingApprovalsAsync(string approverUserId, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        return await GetPendingApprovalsAsync(approverUserId, Array.Empty<string>(), pageNumber, pageSize, cancellationToken);
    }

    public async Task<PagedResult<ContractApprovalDto>> GetPendingApprovalsAsync(string approverUserId, string[] approverRoles, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting pending approvals for user {UserId} with roles {Roles}, page {PageNumber}", approverUserId, string.Join(", ", approverRoles), pageNumber);

        var paged = approverRoles.Length > 0
            ? await _approvalRepository.GetPendingForApproverAsync(approverUserId, approverRoles, pageNumber, pageSize, cancellationToken)
            : await _approvalRepository.GetPendingForApproverAsync(approverUserId, pageNumber, pageSize, cancellationToken);
        var mapped = new PagedResult<ContractApprovalDto>(
            paged.Items.Select(a => new ContractApprovalDto
            {
                Id = a.Id,
                ContractId = a.ContractId,
                EmployeeId = a.Contract?.EmployeeId ?? 0,
                Status = a.Status,
                Comments = a.Comments,
                RequestedBy = a.RequestedBy,
                RequestedAt = a.RequestedAt,
                CurrentApprovalLevel = a.CurrentApprovalLevel,
                MaxApprovalLevel = a.MaxApprovalLevel,
                ApprovalSteps = a.ApprovalSteps.OrderBy(s => s.StepOrder).Select(s => new ContractApprovalStepDto
                {
                    Id = s.Id,
                    StepOrder = s.StepOrder,
                    StepName = s.StepName,
                    ApproverRole = s.ApproverRole,
                    ApproverUserId = s.ApproverUserId,
                    ApproverUserName = s.ApproverUserName,
                    Status = s.Status,
                    Comments = s.Comments,
                    ProcessedAt = s.ProcessedAt,
                    ProcessedBy = s.ProcessedBy,
                    DueDate = s.DueDate
                }).ToList()
            }).ToList(),
            paged.TotalCount,
            paged.PageNumber,
            paged.PageSize
        );

        _logger.LogInformation("Found {Count} pending approvals for user {UserId}", mapped.TotalCount, approverUserId);
        return mapped;
    }

    public async Task<List<ContractApprovalStepDto>> GetApprovalHistoryAsync(int contractId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting approval history for contract {ContractId}", contractId);

        var pending = await _approvalRepository.GetPendingByContractIdAsync(contractId, cancellationToken);
        if (pending == null)
        {
            _logger.LogInformation("No approval found for contract {ContractId}", contractId);
            return new List<ContractApprovalStepDto>();
        }

        var steps = pending.ApprovalSteps
            .OrderBy(s => s.StepOrder)
            .Select(s => new ContractApprovalStepDto
            {
                Id = s.Id,
                StepOrder = s.StepOrder,
                StepName = s.StepName,
                ApproverRole = s.ApproverRole,
                ApproverUserId = s.ApproverUserId,
                ApproverUserName = s.ApproverUserName,
                Status = s.Status,
                Comments = s.Comments,
                ProcessedAt = s.ProcessedAt,
                ProcessedBy = s.ProcessedBy,
                DueDate = s.DueDate
            }).ToList();

        _logger.LogInformation("Found {Count} approval steps for contract {ContractId}", steps.Count, contractId);
        return steps;
    }
}


