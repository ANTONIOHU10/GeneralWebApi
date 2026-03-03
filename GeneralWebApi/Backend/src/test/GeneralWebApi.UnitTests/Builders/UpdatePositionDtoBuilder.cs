using GeneralWebApi.DTOs.Position;

namespace GeneralWebApi.UnitTests.Builders;

/// <summary>
/// Fluent builder for <see cref="UpdatePositionDto"/> for position update tests.
/// </summary>
public sealed class UpdatePositionDtoBuilder
{
    private int _id = 1;
    private string _title = "Software Engineer";
    private string _code = "SE";
    private string _description = "Develops software";
    private int _departmentId = 10;
    private int _level = 1;
    private int? _parentPositionId = null;
    private decimal? _minSalary = 50000m;
    private decimal? _maxSalary = 80000m;
    private bool _isManagement;

    public UpdatePositionDtoBuilder WithId(int id)
    {
        _id = id;
        return this;
    }

    public UpdatePositionDtoBuilder WithTitle(string title)
    {
        _title = title;
        return this;
    }

    public UpdatePositionDtoBuilder WithCode(string code)
    {
        _code = code;
        return this;
    }

    /// <summary>
    /// Builds an <see cref="UpdatePositionDto"/> with the configured values.
    /// </summary>
    public UpdatePositionDto Build()
    {
        return new UpdatePositionDto
        {
            Id = _id,
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
