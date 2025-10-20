using GeneralWebApi.Domain.Entities.Base;
using GeneralWebApi.Domain.Entities.Documents;

namespace GeneralWebApi.Domain.Entities.Documents.Approvals;

public class ContractApproval : BaseEntity
{
    public int ContractId { get; set; }

    // Pending, Approved, Rejected, Cancelled
    public string Status { get; set; } = "Pending";

    public string? Comments { get; set; }
    public string RequestedBy { get; set; } = string.Empty;
    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

    public string? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? RejectedBy { get; set; }
    public DateTime? RejectedAt { get; set; }
    public string? RejectionReason { get; set; }

    public int CurrentApprovalLevel { get; set; } = 1;
    public int MaxApprovalLevel { get; set; } = 1;

    public string? ApprovalWorkflow { get; set; }

    // Navigation
    public Contract Contract { get; set; } = null!;
    public ICollection<ContractApprovalStep> ApprovalSteps { get; set; } = new List<ContractApprovalStep>();
}


