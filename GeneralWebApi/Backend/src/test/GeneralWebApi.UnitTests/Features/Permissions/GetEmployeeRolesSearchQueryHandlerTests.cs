using AutoMapper;
using FluentAssertions;
using GeneralWebApi.Application.Features.Permissions.Roles.Handlers;
using GeneralWebApi.Application.Features.Permissions.Roles.Queries;
using GeneralWebApi.DTOs.Permissions;
using GeneralWebApi.Integration.Repository.Interfaces;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Permissions;

public sealed class GetEmployeeRolesSearchQueryHandlerTests
{
    private readonly Mock<IEmployeeRoleRepository> _employeeRoleRepositoryMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly GetEmployeeRolesSearchQueryHandler _sut;

    public GetEmployeeRolesSearchQueryHandlerTests()
    {
        _employeeRoleRepositoryMock = new Mock<IEmployeeRoleRepository>(MockBehavior.Strict);
        _mapperMock = new Mock<IMapper>(MockBehavior.Strict);
        _sut = new GetEmployeeRolesSearchQueryHandler(_employeeRoleRepositoryMock.Object, _mapperMock.Object);
    }

    [Fact]
    public async Task Handle_UsesSearchAsync_WhenSearchDtoProvided()
    {
        // Arrange
        var searchDto = new EmployeeRoleSearchDto
        {
            EmployeeId = 1,
            PageNumber = 1,
            PageSize = 10
        };

        var roles = new List<GeneralWebApi.Domain.Entities.Permissions.EmployeeRole>
        {
            new() { Id = 1, EmployeeId = 1, RoleId = 2 }
        };

        _employeeRoleRepositoryMock
            .Setup(r => r.SearchAsync(
                searchDto.EmployeeId,
                searchDto.EmployeeName,
                searchDto.EmployeeNumber,
                searchDto.RoleId,
                searchDto.RoleName,
                searchDto.IsActive,
                searchDto.AssignedFrom,
                searchDto.AssignedTo,
                searchDto.ExpiryFrom,
                searchDto.ExpiryTo,
                searchDto.SortBy,
                searchDto.SortDescending,
                searchDto.PageNumber,
                searchDto.PageSize))
            .ReturnsAsync(roles);

        var mappedDtos = new List<EmployeeRoleDto>
        {
            new() { Id = 1, EmployeeId = 1, RoleId = 2 }
        };

        _mapperMock
            .Setup(m => m.Map<List<EmployeeRoleDto>>(roles))
            .Returns(mappedDtos);

        var query = new GetEmployeeRolesSearchQuery { SearchDto = searchDto };

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.Should().HaveCount(1);
        result[0].EmployeeId.Should().Be(1);
        result[0].RoleId.Should().Be(2);
    }

    [Fact]
    public async Task Handle_UsesGetAll_WhenSearchDtoIsNull()
    {
        // Arrange
        var roles = new List<GeneralWebApi.Domain.Entities.Permissions.EmployeeRole>
        {
            new() { Id = 1, EmployeeId = 1, RoleId = 2 }
        };

        _employeeRoleRepositoryMock
            .Setup(r => r.GetAllAsync())
            .ReturnsAsync(roles);

        var mappedDtos = new List<EmployeeRoleDto>
        {
            new() { Id = 1, EmployeeId = 1, RoleId = 2 }
        };

        _mapperMock
            .Setup(m => m.Map<List<EmployeeRoleDto>>(roles))
            .Returns(mappedDtos);

        var query = new GetEmployeeRolesSearchQuery { SearchDto = null };

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.Should().HaveCount(1);
        _employeeRoleRepositoryMock.Verify(r => r.GetAllAsync(), Times.Once);
        _employeeRoleRepositoryMock.Verify(r => r.SearchAsync(
            It.IsAny<int?>(),
            It.IsAny<string?>(),
            It.IsAny<string?>(),
            It.IsAny<int?>(),
            It.IsAny<string?>(),
            It.IsAny<bool?>(),
            It.IsAny<DateTime?>(),
            It.IsAny<DateTime?>(),
            It.IsAny<DateTime?>(),
            It.IsAny<DateTime?>(),
            It.IsAny<string?>(),
            It.IsAny<bool>(),
            It.IsAny<int>(),
            It.IsAny<int>()), Times.Never);
    }
}

