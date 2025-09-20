namespace GeneralWebApi.DTOs.Certification;

public class CertificationDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string? EmployeeName { get; set; }
    public string Name { get; set; } = string.Empty;
    public string IssuingOrganization { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string CredentialId { get; set; } = string.Empty;
    public string CredentialUrl { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}





