namespace GeneralWebApi.DTOs.Contract;

public class CreateContractDto
{
    public int EmployeeId { get; set; }
    public string ContractType { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Status { get; set; } = "Active";
    public decimal? Salary { get; set; }
    public string Notes { get; set; } = string.Empty;
    public DateTime? RenewalReminderDate { get; set; }
    
    // Approval settings (optional - if provided, contract will be automatically submitted for approval)
    public bool SubmitForApproval { get; set; } = false;
    public string? ApprovalComments { get; set; }
    public List<ApprovalStepDto>? ApprovalSteps { get; set; }
}

public class ApprovalStepDto
{
    public int StepOrder { get; set; }
    public string StepName { get; set; } = string.Empty;
    public string? ApproverUserId { get; set; }
    public string? ApproverUserName { get; set; }
    public string? ApproverRole { get; set; }
}





