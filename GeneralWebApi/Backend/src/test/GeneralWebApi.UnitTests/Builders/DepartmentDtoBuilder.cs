using GeneralWebApi.DTOs.Department;

namespace GeneralWebApi.UnitTests.Builders;

/// <summary>
/// Fluent builder for <see cref="DepartmentDto"/> to create consistent test data
/// for department handler tests.
/// </summary>
public sealed class DepartmentDtoBuilder
{
    private int _id = 1;
    private string _name = "Engineering";
    private string _code = "ENG";
    private string _description = "Engineering department";
    private int? _parentDepartmentId = null;
    private string? _parentDepartmentName = null;
    private int _level = 1;
    private string _path = "/1";
    private DateTime _createdAt = new(2024, 1, 1, 10, 0, 0, DateTimeKind.Utc);
    private DateTime? _updatedAt = null;

    public DepartmentDtoBuilder WithId(int id)
    {
        _id = id;
        return this;
    }

    public DepartmentDtoBuilder WithName(string name)
    {
        _name = name;
        return this;
    }

    public DepartmentDtoBuilder WithCode(string code)
    {
        _code = code;
        return this;
    }

    public DepartmentDtoBuilder WithParent(int? parentId, string? parentName = null)
    {
        _parentDepartmentId = parentId;
        _parentDepartmentName = parentName;
        return this;
    }

    public DepartmentDtoBuilder WithLevel(int level)
    {
        _level = level;
        return this;
    }

    /// <summary>
    /// Builds a <see cref="DepartmentDto"/> with the configured values.
    /// </summary>
    public DepartmentDto Build()
    {
        return new DepartmentDto
        {
            Id = _id,
            Name = _name,
            Code = _code,
            Description = _description,
            ParentDepartmentId = _parentDepartmentId,
            ParentDepartmentName = _parentDepartmentName,
            Level = _level,
            Path = _path,
            CreatedAt = _createdAt,
            UpdatedAt = _updatedAt
        };
    }
}
