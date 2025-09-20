namespace GeneralWebApi.DTOs.Position;

public class UpdatePositionDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int DepartmentId { get; set; }
    public int Level { get; set; } = 1;
    public int? ParentPositionId { get; set; }
    public decimal? MinSalary { get; set; }
    public decimal? MaxSalary { get; set; }
    public bool IsManagement { get; set; } = false;
}

