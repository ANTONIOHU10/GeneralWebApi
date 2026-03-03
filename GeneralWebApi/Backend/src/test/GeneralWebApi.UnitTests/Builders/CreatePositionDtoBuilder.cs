using GeneralWebApi.DTOs.Position;

namespace GeneralWebApi.UnitTests.Builders;

/// <summary>
/// Fluent builder for <see cref="CreatePositionDto"/> for position creation tests.
/// </summary>
public sealed class CreatePositionDtoBuilder
{
    private string _title = "Software Engineer";
    private string _code = "SE";
    private string _description = "Develops software";
    private int _departmentId = 10;
    private int _level = 1;
    private int? _parentPositionId = null;
    private decimal? _minSalary = 50000m;
    private decimal? _maxSalary = 80000m;
    private bool _isManagement;

    public CreatePositionDtoBuilder WithTitle(string title)
    {
        _title = title;
        return this;
    }

    public CreatePositionDtoBuilder WithCode(string code)
    {
        _code = code;
        return this;
    }

    public CreatePositionDtoBuilder WithDepartment(int departmentId)
    {
        _departmentId = departmentId;
        return this;
    }

    public CreatePositionDtoBuilder WithLevel(int level)
    {
        _level = level;
        return this;
    }

    /// <summary>
    /// Builds a <see cref="CreatePositionDto"/> with the configured values.
    /// </summary>
    public CreatePositionDto Build()
    {
        return new CreatePositionDto
        {
            Title = _title,
            Code = _code,
            Description = _description,
            DepartmentId = _departmentId,
            Level = _level,
            ParentPositionId = _parentPositionId,
            MinSalary = _minSalary,
            MaxSalary = _maxSalary,
            IsManagement = _isManagement
        };
    }
}
