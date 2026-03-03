using GeneralWebApi.DTOs.Department;

namespace GeneralWebApi.UnitTests.Builders;

/// <summary>
/// Fluent builder for <see cref="CreateDepartmentDto"/> for department creation tests.
/// </summary>
public sealed class CreateDepartmentDtoBuilder
{
    private string _name = "Engineering";
    private string _code = "ENG";
    private string _description = "Engineering department";
    private int? _parentDepartmentId = null;
    private int _level = 1;
    private string _path = "/1";

    public CreateDepartmentDtoBuilder WithName(string name)
    {
        _name = name;
        return this;
    }

    public CreateDepartmentDtoBuilder WithCode(string code)
    {
        _code = code;
        return this;
    }

    public CreateDepartmentDtoBuilder WithParent(int? parentId)
    {
        _parentDepartmentId = parentId;
        return this;
    }

    public CreateDepartmentDtoBuilder WithLevel(int level)
    {
        _level = level;
        return this;
    }

    /// <summary>
    /// Builds a <see cref="CreateDepartmentDto"/> with the configured values.
    /// </summary>
    public CreateDepartmentDto Build()
    {
        return new CreateDepartmentDto
        {
            Name = _name,
            Code = _code,
            Description = _description,
            ParentDepartmentId = _parentDepartmentId,
            Level = _level,
            Path = _path
        };
    }
}
