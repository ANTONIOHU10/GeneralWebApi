namespace GeneralWebApi.DTOs.Department;

public class DepartmentListDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int? ParentDepartmentId { get; set; }
    public string? ParentDepartmentName { get; set; }
    public int Level { get; set; }
    public string Path { get; set; } = string.Empty;
    public int EmployeeCount { get; set; }
    public int PositionCount { get; set; }
}





