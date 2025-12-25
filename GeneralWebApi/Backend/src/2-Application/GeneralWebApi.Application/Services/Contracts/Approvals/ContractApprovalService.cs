using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Documents.Approvals;
using GeneralWebApi.DTOs.Contracts.Approvals;
using GeneralWebApi.DTOs.Notification;
using GeneralWebApi.Integration.Repository.DocumentsRepository;
using GeneralWebApi.Integration.Repository.DocumentsRepository.Approvals;
using GeneralWebApi.Application.Services;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Application.Services.Contracts.Approvals;

public class ContractApprovalService : IContractApprovalService
{
    private readonly IContractRepository _contractRepository;
    private readonly IContractApprovalRepository _approvalRepository;
    private readonly INotificationService _notificationService;
    private readonly ILogger<ContractApprovalService> _logger;

    public ContractApprovalService(
        IContractRepository contractRepository,
        IContractApprovalRepository approvalRepository,
        INotificationService notificationService,
        ILogger<ContractApprovalService> logger)
    {
        _contractRepository = contractRepository ?? throw new ArgumentNullException(nameof(contractRepository));
        _approvalRepository = approvalRepository ?? throw new ArgumentNullException(nameof(approvalRepository));
        _notificationService = notificationService ?? throw new ArgumentNullException(nameof(notificationService));
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

        // Reload contract with Employee navigation property for notification
        var contractWithEmployee = await _contractRepository.GetByIdAsync(contractId, cancellationToken);

        // Create notifications for approvers
        await CreateNotificationsForApproversAsync(savedWithContract, contractWithEmployee, cancellationToken);

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

        var contract = await _contractRepository.GetByIdAsync(approval.ContractId, cancellationToken);
        
        if (approval.CurrentApprovalLevel < approval.MaxApprovalLevel)
        {
            approval.CurrentApprovalLevel++;
            _logger.LogInformation("Approval {ApprovalId} moved to level {Level}", approvalId, approval.CurrentApprovalLevel);
            
            // Create notification for next level approver
            await CreateNotificationForNextApproverAsync(approval, contract, cancellationToken);
        }
        else
        {
            approval.Status = "Approved";
            approval.ApprovedBy = approverId;
            approval.ApprovedAt = DateTime.UtcNow;
            _logger.LogInformation("Approval {ApprovalId} completed", approvalId);

            // Update contract status to Active when approval is completed
            if (contract != null)
            {
                contract.Status = "Active";
                await _contractRepository.UpdateAsync(contract, cancellationToken);
                _logger.LogInformation("Contract {ContractId} status updated to Active after approval", contract.Id);
            }
            
            // Create notification for requester that approval is completed
            await CreateApprovalCompletedNotificationAsync(approval, contract, cancellationToken);
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
        
        // Create notification for requester that approval is rejected
        await CreateApprovalRejectedNotificationAsync(approval, contract, cancellationToken);
        
        return true;
    }
    
    /// <summary>
    /// Create notifications for all approvers in the first step
    /// </summary>
    private async System.Threading.Tasks.Task CreateNotificationsForApproversAsync(
        ContractApproval approval,
        Domain.Entities.Documents.Contract? contract,
        CancellationToken cancellationToken)
    {
        if (approval == null || contract == null)
        {
            return;
        }

        // Get employee name for notification
        var employeeName = GetEmployeeName(contract);
        
        // Get first step approvers
        var firstStep = approval.ApprovalSteps
            .Where(s => s.StepOrder == approval.CurrentApprovalLevel && s.Status == "Pending")
            .FirstOrDefault();

        if (firstStep == null)
        {
            _logger.LogWarning("No pending step found for approval {ApprovalId} to create notifications", approval.Id);
            return;
        }

        // If ApproverUserId is specified, create notification for that user
        if (!string.IsNullOrEmpty(firstStep.ApproverUserId))
        {
            var priority = CalculatePriority(firstStep.DueDate);
            
            try
            {
                await _notificationService.CreateAsync(new CreateNotificationDto
                {
                    UserId = firstStep.ApproverUserId,
                    Type = "approval",
                    Priority = priority,
                    Title = $"Contract Approval Required: {employeeName}",
                    Message = $"You have a pending contract approval for {employeeName}. Current step: {approval.CurrentApprovalLevel}/{approval.MaxApprovalLevel}",
                    Icon = "check_circle",
                    ActionUrl = $"/contract-approvals/{approval.Id}",
                    ActionLabel = "Review Approval",
                    SourceType = "ContractApproval",
                    SourceId = approval.Id.ToString(),
                    Metadata = new Dictionary<string, object>
                    {
                        { "contractId", approval.ContractId },
                        { "employeeName", employeeName },
                        { "currentStep", approval.CurrentApprovalLevel },
                        { "totalSteps", approval.MaxApprovalLevel },
                        { "stepName", firstStep.StepName }
                    },
                    ExpiresAt = firstStep.DueDate
                }, cancellationToken);
                
                _logger.LogInformation("Created notification for approver {ApproverId} for approval {ApprovalId}", 
                    firstStep.ApproverUserId, approval.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create notification for approver {ApproverId} for approval {ApprovalId}", 
                    firstStep.ApproverUserId, approval.Id);
            }
        }
        else
        {
            _logger.LogWarning("No ApproverUserId specified for step {StepOrder} of approval {ApprovalId}", 
                firstStep.StepOrder, approval.Id);
        }
    }
    
    /// <summary>
    /// Create notification for next level approver
    /// </summary>
    private async System.Threading.Tasks.Task CreateNotificationForNextApproverAsync(
        ContractApproval approval,
        Domain.Entities.Documents.Contract? contract,
        CancellationToken cancellationToken)
    {
        if (approval == null || contract == null)
        {
            return;
        }

        var nextStep = approval.ApprovalSteps
            .FirstOrDefault(s => s.StepOrder == approval.CurrentApprovalLevel && s.Status == "Pending");

        if (nextStep == null || string.IsNullOrEmpty(nextStep.ApproverUserId))
        {
            _logger.LogWarning("No next step approver found for approval {ApprovalId}", approval.Id);
            return;
        }

        var employeeName = GetEmployeeName(contract);
        var priority = CalculatePriority(nextStep.DueDate);

        try
        {
            await _notificationService.CreateAsync(new CreateNotificationDto
            {
                UserId = nextStep.ApproverUserId,
                Type = "approval",
                Priority = priority,
                Title = $"Contract Approval Required: {employeeName}",
                Message = $"Contract approval moved to your level. Step: {nextStep.StepOrder}/{approval.MaxApprovalLevel}",
                Icon = "check_circle",
                ActionUrl = $"/contract-approvals/{approval.Id}",
                ActionLabel = "Review Approval",
                SourceType = "ContractApproval",
                SourceId = approval.Id.ToString(),
                Metadata = new Dictionary<string, object>
                {
                    { "contractId", approval.ContractId },
                    { "employeeName", employeeName },
                    { "currentStep", nextStep.StepOrder },
                    { "totalSteps", approval.MaxApprovalLevel },
                    { "stepName", nextStep.StepName }
                },
                ExpiresAt = nextStep.DueDate
            }, cancellationToken);
            
            _logger.LogInformation("Created notification for next approver {ApproverId} for approval {ApprovalId}", 
                nextStep.ApproverUserId, approval.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create notification for next approver {ApproverId} for approval {ApprovalId}", 
                nextStep.ApproverUserId, approval.Id);
        }
    }
    
    /// <summary>
    /// Create notification when approval is completed
    /// </summary>
    private async System.Threading.Tasks.Task CreateApprovalCompletedNotificationAsync(
        ContractApproval approval,
        Domain.Entities.Documents.Contract? contract,
        CancellationToken cancellationToken)
    {
        if (approval == null || string.IsNullOrEmpty(approval.RequestedBy))
        {
            return;
        }

        var employeeName = contract != null ? GetEmployeeName(contract) : $"Contract #{approval.ContractId}";

        try
        {
            await _notificationService.CreateAsync(new CreateNotificationDto
            {
                UserId = approval.RequestedBy,
                Type = "approval",
                Priority = "medium",
                Title = $"Contract Approved: {employeeName}",
                Message = $"Your contract approval request has been approved successfully.",
                Icon = "check_circle",
                ActionUrl = $"/contracts/{approval.ContractId}",
                ActionLabel = "View Contract",
                SourceType = "ContractApproval",
                SourceId = approval.Id.ToString(),
                Metadata = new Dictionary<string, object>
                {
                    { "contractId", approval.ContractId },
                    { "employeeName", employeeName },
                    { "approvedAt", approval.ApprovedAt?.ToString("O") ?? DateTime.UtcNow.ToString("O") }
                }
            }, cancellationToken);
            
            _logger.LogInformation("Created approval completed notification for requester {RequesterId} for approval {ApprovalId}", 
                approval.RequestedBy, approval.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create approval completed notification for requester {RequesterId} for approval {ApprovalId}", 
                approval.RequestedBy, approval.Id);
        }
    }
    
    /// <summary>
    /// Create notification when approval is rejected
    /// </summary>
    private async System.Threading.Tasks.Task CreateApprovalRejectedNotificationAsync(
        ContractApproval approval,
        Domain.Entities.Documents.Contract? contract,
        CancellationToken cancellationToken)
    {
        if (approval == null || string.IsNullOrEmpty(approval.RequestedBy))
        {
            return;
        }

        var employeeName = contract != null ? GetEmployeeName(contract) : $"Contract #{approval.ContractId}";

        try
        {
            await _notificationService.CreateAsync(new CreateNotificationDto
            {
                UserId = approval.RequestedBy,
                Type = "approval",
                Priority = "high",
                Title = $"Contract Approval Rejected: {employeeName}",
                Message = $"Your contract approval request has been rejected. Reason: {approval.RejectionReason ?? "No reason provided"}",
                Icon = "cancel",
                ActionUrl = $"/contracts/{approval.ContractId}",
                ActionLabel = "View Contract",
                SourceType = "ContractApproval",
                SourceId = approval.Id.ToString(),
                Metadata = new Dictionary<string, object>
                {
                    { "contractId", approval.ContractId },
                    { "employeeName", employeeName },
                    { "rejectionReason", approval.RejectionReason ?? "" },
                    { "rejectedAt", approval.RejectedAt?.ToString("O") ?? DateTime.UtcNow.ToString("O") }
                }
            }, cancellationToken);
            
            _logger.LogInformation("Created approval rejected notification for requester {RequesterId} for approval {ApprovalId}", 
                approval.RequestedBy, approval.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create approval rejected notification for requester {RequesterId} for approval {ApprovalId}", 
                approval.RequestedBy, approval.Id);
        }
    }
    
    /// <summary>
    /// Get employee name from contract
    /// </summary>
    private string GetEmployeeName(Domain.Entities.Documents.Contract contract)
    {
        // Try to get employee name from contract navigation property
        if (contract.Employee != null)
        {
            var firstName = contract.Employee.FirstName ?? "";
            var lastName = contract.Employee.LastName ?? "";
            return $"{firstName} {lastName}".Trim();
        }
        
        // Fallback to contract ID if employee info not available
        return $"Contract #{contract.Id}";
    }
    
    /// <summary>
    /// Calculate notification priority based on due date
    /// </summary>
    private string CalculatePriority(DateTime? dueDate)
    {
        if (!dueDate.HasValue)
        {
            return "medium";
        }

        var daysUntilDue = (dueDate.Value - DateTime.UtcNow).TotalDays;
        
        if (daysUntilDue < 1)
        {
            return "urgent";
        }
        else if (daysUntilDue < 3)
        {
            return "high";
        }
        else if (daysUntilDue < 7)
        {
            return "medium";
        }
        else
        {
            return "low";
        }
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


