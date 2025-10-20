namespace GeneralWebApi.DTOs.IdentityDocument;

public class IdentityDocumentDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string? EmployeeName { get; set; }
    public string DocumentType { get; set; } = string.Empty;
    public string DocumentNumber { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    public DateTime ExpirationDate { get; set; }
    public string IssuingAuthority { get; set; } = string.Empty;
    public string IssuingPlace { get; set; } = string.Empty;
    public string IssuingCountry { get; set; } = string.Empty;
    public string IssuingState { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}





