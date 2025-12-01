namespace GeneralWebApi.DTOs.Contracts.Approvals;

public class ContractApprovalDto
{
    public int Id { get; set; }
    public int ContractId { get; set; }
    public int EmployeeId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Comments { get; set; }
    public string RequestedBy { get; set; } = string.Empty;
    public DateTime RequestedAt { get; set; }
    public string? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? RejectedBy { get; set; }
    public DateTime? RejectedAt { get; set; }
    public string? RejectionReason { get; set; }
    public int CurrentApprovalLevel { get; set; }
    public int MaxApprovalLevel { get; set; }
    public List<ContractApprovalStepDto> ApprovalSteps { get; set; } = new();
}

public class ContractApprovalStepDto
{
    public int Id { get; set; }
    public int StepOrder { get; set; }
    public string StepName { get; set; } = string.Empty;
    public string ApproverRole { get; set; } = string.Empty;
    public string? ApproverUserId { get; set; }
    public string? ApproverUserName { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Comments { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public string? ProcessedBy { get; set; }
    public DateTime? DueDate { get; set; }
}

public class SubmitApprovalRequest
{
    public string? Comments { get; set; }
    public List<ApprovalStepRequest>? ApprovalSteps { get; set; }
}

public class ApprovalStepRequest
{
    public int StepOrder { get; set; }
    public string StepName { get; set; } = string.Empty;
    public string? ApproverUserId { get; set; }
    public string? ApproverUserName { get; set; }
    public string? ApproverRole { get; set; }
}

public class ApprovalActionRequest
{
    public string? Comments { get; set; }
}

public class RejectionActionRequest
{
    public string Reason { get; set; } = string.Empty;
}


