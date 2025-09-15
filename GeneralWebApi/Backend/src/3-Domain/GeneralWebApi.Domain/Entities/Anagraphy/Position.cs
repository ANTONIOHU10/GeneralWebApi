using GeneralWebApi.Domain.Entities.Base;

namespace GeneralWebApi.Domain.Entities.Anagraphy;

public class Position : BaseEntity
{

    public string Title { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int DepartmentId { get; set; }
    public int Level { get; set; } = 1;
    public int? ParentPositionId { get; set; }
    public decimal? MinSalary { get; set; }
    public decimal? MaxSalary { get; set; }
    public bool IsManagement { get; set; } = false;

    #region navigation properties
    public Position? ParentPosition { get; set; }
    public ICollection<Position> SubPositions { get; set; } = [];
    public ICollection<Employee> Employees { get; set; } = [];
    public Department? Department { get; set; } = null!;
    #endregion

}