namespace GeneralWebApi.DTOs.Department;

public class UpdateDepartmentDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int? ParentDepartmentId { get; set; }
    public int Level { get; set; } = 1;
    public string Path { get; set; } = string.Empty;
}

