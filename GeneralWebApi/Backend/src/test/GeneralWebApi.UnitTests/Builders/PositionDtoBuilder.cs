using GeneralWebApi.DTOs.Position;

namespace GeneralWebApi.UnitTests.Builders;

/// <summary>
/// Fluent builder for <see cref="PositionDto"/> for position handler tests.
/// </summary>
public sealed class PositionDtoBuilder
{
    private int _id = 1;
    private string _title = "Software Engineer";
    private string _code = "SE";
    private string _description = "Develops software";
    private int _departmentId = 10;
    private string? _departmentName = "Engineering";
    private int _level = 1;
    private int? _parentPositionId = null;
    private string? _parentPositionTitle = null;
    private decimal? _minSalary = 50000m;
    private decimal? _maxSalary = 80000m;
    private bool _isManagement;
    private DateTime _createdAt = new(2024, 1, 1, 10, 0, 0, DateTimeKind.Utc);
    private DateTime? _updatedAt = null;

    public PositionDtoBuilder WithId(int id)
    {
        _id = id;
        return this;
    }

    public PositionDtoBuilder WithTitle(string title)
    {
        _title = title;
        return this;
    }

    public PositionDtoBuilder WithCode(string code)
    {
        _code = code;
        return this;
    }

    public PositionDtoBuilder WithDepartment(int departmentId, string? departmentName = null)
    {
        _departmentId = departmentId;
        _departmentName = departmentName;
        return this;
    }

    public PositionDtoBuilder WithLevel(int level)
    {
        _level = level;
        return this;
    }

    /// <summary>
    /// Builds a <see cref="PositionDto"/> with the configured values.
    /// </summary>
    public PositionDto Build()
    {
        return new PositionDto
        {
            Id = _id,
            Title = _title,
            Code = _code,
            Description = _description,
            DepartmentId = _departmentId,
            DepartmentName = _departmentName,
            Level = _level,
            ParentPositionId = _parentPositionId,
            ParentPositionTitle = _parentPositionTitle,
            MinSalary = _minSalary,
            MaxSalary = _maxSalary,
            IsManagement = _isManagement,
            CreatedAt = _createdAt,
            UpdatedAt = _updatedAt
        };
    }
}
