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
}



