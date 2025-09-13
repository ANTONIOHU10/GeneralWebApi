using GeneralWebApi.Domain.Entities.Base;

namespace GeneralWebApi.Domain.Entities.Anagraphy;

public class Department : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    // department code
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int? ParentDepartmentId { get; set; }
    // Level 1 = top level, 2 = second level, etc.
    public int Level { get; set; }
    // esempio IT/Development

    public int? ManagerId { get; set; }
    public string Path { get; set; } = string.Empty;

    #region navigation properties
    public ICollection<Employee> Employees { get; set; } = [];
    public ICollection<Department> SubDepartments { get; set; } = [];
    public ICollection<Position> Positions { get; set; } = [];
    public Department? ParentDepartment { get; set; }
    public Employee? Manager { get; set; }
    #endregion

}