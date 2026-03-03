using GeneralWebApi.DTOs.Department;

namespace GeneralWebApi.UnitTests.Builders;

/// <summary>
/// Fluent builder for <see cref="DepartmentSearchDto"/> for department query tests.
/// </summary>
public sealed class DepartmentSearchDtoBuilder
{
    private int _pageNumber = 1;
    private int _pageSize = 10;
    private string? _searchTerm;
    private int? _parentDepartmentId;
    private int? _level;
    private string? _name;
    private string? _code;
    private string? _sortBy = "Name";
    private bool _sortDescending;

    public DepartmentSearchDtoBuilder WithPage(int pageNumber, int pageSize)
    {
        _pageNumber = pageNumber;
        _pageSize = pageSize;
        return this;
    }

    public DepartmentSearchDtoBuilder WithSearchTerm(string? searchTerm)
    {
        _searchTerm = searchTerm;
        return this;
    }

    public DepartmentSearchDtoBuilder WithParent(int? parentDepartmentId)
    {
        _parentDepartmentId = parentDepartmentId;
        return this;
    }

    public DepartmentSearchDtoBuilder WithLevel(int? level)
    {
        _level = level;
        return this;
    }

    /// <summary>
    /// Builds a <see cref="DepartmentSearchDto"/> with the configured values.
    /// </summary>
    public DepartmentSearchDto Build()
    {
        return new DepartmentSearchDto
        {
            PageNumber = _pageNumber,
            PageSize = _pageSize,
            SearchTerm = _searchTerm,
            ParentDepartmentId = _parentDepartmentId,
            Level = _level,
            Name = _name,
            Code = _code,
            SortBy = _sortBy,
            SortDescending = _sortDescending
        };
    }
}
