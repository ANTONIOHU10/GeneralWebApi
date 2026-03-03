using GeneralWebApi.DTOs.Position;

namespace GeneralWebApi.UnitTests.Builders;

/// <summary>
/// Fluent builder for <see cref="PositionSearchDto"/> for position query tests.
/// </summary>
public sealed class PositionSearchDtoBuilder
{
    private int _pageNumber = 1;
    private int _pageSize = 10;
    private string? _searchTerm;
    private int? _departmentId;
    private int? _level;
    private bool? _isManagement;
    private string? _sortBy = "Title";
    private bool _sortDescending;

    public PositionSearchDtoBuilder WithPage(int pageNumber, int pageSize)
    {
        _pageNumber = pageNumber;
        _pageSize = pageSize;
        return this;
    }

    public PositionSearchDtoBuilder WithDepartment(int? departmentId)
    {
        _departmentId = departmentId;
        return this;
    }

    public PositionSearchDtoBuilder WithSearchTerm(string? searchTerm)
    {
        _searchTerm = searchTerm;
        return this;
    }

    /// <summary>
    /// Builds a <see cref="PositionSearchDto"/> with the configured values.
    /// </summary>
    public PositionSearchDto Build()
    {
        return new PositionSearchDto
        {
            PageNumber = _pageNumber,
            PageSize = _pageSize,
            SearchTerm = _searchTerm,
            DepartmentId = _departmentId,
            Level = _level,
            IsManagement = _isManagement,
            SortBy = _sortBy,
            SortDescending = _sortDescending
        };
    }
}
