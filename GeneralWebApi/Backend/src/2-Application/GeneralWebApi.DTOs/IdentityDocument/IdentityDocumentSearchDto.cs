namespace GeneralWebApi.DTOs.IdentityDocument;

public class IdentityDocumentSearchDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SearchTerm { get; set; }
    public int? EmployeeId { get; set; }
    public string? DocumentType { get; set; }
    public string? IssuingAuthority { get; set; }
    public string? IssuingCountry { get; set; }
    public DateTime? ExpirationDateFrom { get; set; }
    public DateTime? ExpirationDateTo { get; set; }
    public string? SortBy { get; set; } = "ExpirationDate";
    public bool SortDescending { get; set; } = false;
}

