using GeneralWebApi.Domain.Entities.Base;

namespace GeneralWebApi.Domain.Entities.Documents.Approvals;

public class ContractApprovalStep : BaseEntity
{
    public int ContractApprovalId { get; set; }

    public int StepOrder { get; set; }
    public string StepName { get; set; } = string.Empty;
    public string ApproverRole { get; set; } = string.Empty;
    public string? ApproverUserId { get; set; }
    public string? ApproverUserName { get; set; }

    // Pending, Approved, Rejected, Skipped
    public string Status { get; set; } = "Pending";
    public string? Comments { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public string? ProcessedBy { get; set; }

    public int? TimeLimitHours { get; set; }
    public DateTime? DueDate { get; set; }

    // Navigation
    public ContractApproval ContractApproval { get; set; } = null!;
}


