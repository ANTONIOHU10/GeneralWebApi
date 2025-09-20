namespace GeneralWebApi.DTOs.Contract;

public class ContractListDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string? EmployeeName { get; set; }
    public string ContractType { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal? Salary { get; set; }
    public string Notes { get; set; } = string.Empty;
    public DateTime? RenewalReminderDate { get; set; }
}

