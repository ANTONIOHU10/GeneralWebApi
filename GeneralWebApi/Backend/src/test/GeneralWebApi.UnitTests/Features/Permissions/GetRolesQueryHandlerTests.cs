using AutoMapper;
using FluentAssertions;
using GeneralWebApi.Application.Features.Permissions.Roles.Handlers;
using GeneralWebApi.Application.Features.Permissions.Roles.Queries;
using GeneralWebApi.DTOs.Permissions;
using GeneralWebApi.Integration.Repository.Interfaces;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Permissions;

/// <summary>
/// Unit tests for <see cref="GetRolesQueryHandler"/>.
/// Focuses on repository interaction, search vs. non-search paths,
/// and population of <see cref="RoleListDto.EmployeeCount"/>.
/// </summary>
public sealed class GetRolesQueryHandlerTests
{
    private readonly Mock<IRoleRepository> _roleRepositoryMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly GetRolesQueryHandler _sut;

    public GetRolesQueryHandlerTests()
    {
        _roleRepositoryMock = new Mock<IRoleRepository>(MockBehavior.Strict);
        _mapperMock = new Mock<IMapper>(MockBehavior.Strict);
        _sut = new GetRolesQueryHandler(_roleRepositoryMock.Object, _mapperMock.Object);
    }

    [Fact]
    public async Task Handle_UsesGetAll_WhenSearchDtoIsNull()
    {
        // Arrange
        var roles = new List<GeneralWebApi.Domain.Entities.Permissions.Role>
        {
            new() { Id = 1, Name = "Admin" },
            new() { Id = 2, Name = "User" }
        };

        _roleRepositoryMock
            .Setup(r => r.GetAllAsync())
            .ReturnsAsync(roles);

        var mappedDtos = new List<RoleListDto>
        {
            new() { Id = 1, Name = "Admin" },
            new() { Id = 2, Name = "User" }
        };

        _mapperMock
            .Setup(m => m.Map<List<RoleListDto>>(roles))
            .Returns(mappedDtos);

        _roleRepositoryMock
            .Setup(r => r.GetEmployeeCountsAsync(It.Is<IEnumerable<int>>(ids =>
                ids.SequenceEqual(new[] { 1, 2 }))))
            .ReturnsAsync(new Dictionary<int, int>
            {
                { 1, 5 },
                { 2, 3 }
            });

        var query = new GetRolesQuery { SearchDto = null };

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result[0].EmployeeCount.Should().Be(5);
        result[1].EmployeeCount.Should().Be(3);

        _roleRepositoryMock.Verify(r => r.GetAllAsync(), Times.Once);
        _roleRepositoryMock.Verify(r => r.SearchAsync(
            It.IsAny<string?>(),
            It.IsAny<string?>(),
            It.IsAny<int?>(),
            It.IsAny<int?>(),
            It.IsAny<DateTime?>(),
            It.IsAny<DateTime?>(),
            It.IsAny<string?>(),
            It.IsAny<bool>(),
            It.IsAny<int>(),
            It.IsAny<int>()), Times.Never);
    }

    [Fact]
    public async Task Handle_UsesSearchAsync_WhenSearchDtoProvided()
    {
        // Arrange
        var searchDto = new RoleSearchDto
        {
            Name = "Admin",
            PageNumber = 1,
            PageSize = 10
        };

        var roles = new List<GeneralWebApi.Domain.Entities.Permissions.Role>
        {
            new() { Id = 1, Name = "Admin" }
        };

        _roleRepositoryMock
            .Setup(r => r.SearchAsync(
                searchDto.Name,
                searchDto.Description,
                searchDto.MinEmployeeCount,
                searchDto.MaxEmployeeCount,
                searchDto.CreatedFrom,
                searchDto.CreatedTo,
                searchDto.SortBy,
                searchDto.SortDescending,
                searchDto.PageNumber,
                searchDto.PageSize))
            .ReturnsAsync(roles);

        var mappedDtos = new List<RoleListDto>
        {
            new() { Id = 1, Name = "Admin" }
        };

        _mapperMock
            .Setup(m => m.Map<List<RoleListDto>>(roles))
            .Returns(mappedDtos);

        _roleRepositoryMock
            .Setup(r => r.GetEmployeeCountsAsync(It.Is<IEnumerable<int>>(ids =>
                ids.SequenceEqual(new[] { 1 }))))
            .ReturnsAsync(new Dictionary<int, int>
            {
                { 1, 10 }
            });

        var query = new GetRolesQuery { SearchDto = searchDto };

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.Should().HaveCount(1);
        result[0].Id.Should().Be(1);
        result[0].EmployeeCount.Should().Be(10);

        _roleRepositoryMock.Verify(r => r.SearchAsync(
            searchDto.Name,
            searchDto.Description,
            searchDto.MinEmployeeCount,
            searchDto.MaxEmployeeCount,
            searchDto.CreatedFrom,
            searchDto.CreatedTo,
            searchDto.SortBy,
            searchDto.SortDescending,
            searchDto.PageNumber,
            searchDto.PageSize), Times.Once);
        _roleRepositoryMock.Verify(r => r.GetAllAsync(), Times.Never);
    }
}

