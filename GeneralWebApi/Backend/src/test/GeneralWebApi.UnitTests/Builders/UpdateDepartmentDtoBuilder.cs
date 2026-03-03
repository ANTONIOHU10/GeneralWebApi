using GeneralWebApi.DTOs.Department;

namespace GeneralWebApi.UnitTests.Builders;

/// <summary>
/// Fluent builder for <see cref="UpdateDepartmentDto"/> for department update tests.
/// </summary>
public sealed class UpdateDepartmentDtoBuilder
{
    private int _id = 1;
    private string _name = "Engineering";
    private string _code = "ENG";
    private string _description = "Engineering department";
    private int? _parentDepartmentId = null;
    private int _level = 1;
    private string _path = "/1";

    public UpdateDepartmentDtoBuilder WithId(int id)
    {
        _id = id;
        return this;
    }

    public UpdateDepartmentDtoBuilder WithName(string name)
    {
        _name = name;
        return this;
    }

    public UpdateDepartmentDtoBuilder WithCode(string code)
    {
        _code = code;
        return this;
    }

    /// <summary>
    /// Builds an <see cref="UpdateDepartmentDto"/> with the configured values.
    /// </summary>
    public UpdateDepartmentDto Build()
    {
        return new UpdateDepartmentDto
        {
            Id = _id,
            Name = _name,
            Code = _code,
            Description = _description,
            ParentDepartmentId = _parentDepartmentId,
            Level = _level,
            Path = _path
        };
    }
}
