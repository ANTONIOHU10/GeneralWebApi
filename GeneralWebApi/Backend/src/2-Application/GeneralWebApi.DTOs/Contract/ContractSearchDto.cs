namespace GeneralWebApi.DTOs.Contract;

public class ContractSearchDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SearchTerm { get; set; }
    public int? EmployeeId { get; set; }
    public string? ContractType { get; set; }
    public string? Status { get; set; }
    public string? SortBy { get; set; } = "CreatedAt";
    public bool SortDescending { get; set; } = true;
}





