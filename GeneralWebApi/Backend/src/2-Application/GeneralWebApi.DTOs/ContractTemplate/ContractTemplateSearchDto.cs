namespace GeneralWebApi.DTOs.ContractTemplate;

/// <summary>
/// Search and paging parameters for contract template list.
/// </summary>
public class ContractTemplateSearchDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SearchTerm { get; set; }
    public string? ContractType { get; set; }
    public string? Category { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsDefault { get; set; }
    public string? SortBy { get; set; } = "CreatedAt";
    public bool SortDescending { get; set; } = true;
}
