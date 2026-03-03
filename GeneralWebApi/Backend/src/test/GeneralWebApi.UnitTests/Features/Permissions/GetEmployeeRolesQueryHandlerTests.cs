using AutoMapper;
using FluentAssertions;
using GeneralWebApi.Application.Features.Permissions.Roles.Handlers;
using GeneralWebApi.Application.Features.Permissions.Roles.Queries;
using GeneralWebApi.DTOs.Permissions;
using GeneralWebApi.Integration.Repository.Interfaces;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Permissions;

public sealed class GetEmployeeRolesQueryHandlerTests
{
    private readonly Mock<IEmployeeRoleRepository> _employeeRoleRepositoryMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly GetEmployeeRolesQueryHandler _sut;

    public GetEmployeeRolesQueryHandlerTests()
    {
        _employeeRoleRepositoryMock = new Mock<IEmployeeRoleRepository>(MockBehavior.Strict);
        _mapperMock = new Mock<IMapper>(MockBehavior.Strict);
        _sut = new GetEmployeeRolesQueryHandler(_employeeRoleRepositoryMock.Object, _mapperMock.Object);
    }

    [Fact]
    public async Task Handle_MapsEmployeeRoles()
    {
        // Arrange
        const int employeeId = 10;

        var roles = new List<GeneralWebApi.Domain.Entities.Permissions.EmployeeRole>
        {
            new() { Id = 1, EmployeeId = employeeId, RoleId = 2 }
        };

        _employeeRoleRepositoryMock
            .Setup(r => r.GetByEmployeeIdAsync(employeeId))
            .ReturnsAsync(roles);

        var mappedDtos = new List<EmployeeRoleDto>
        {
            new() { Id = 1, EmployeeId = employeeId, RoleId = 2 }
        };

        _mapperMock
            .Setup(m => m.Map<List<EmployeeRoleDto>>(roles))
            .Returns(mappedDtos);

        var query = new GetEmployeeRolesQuery { EmployeeId = employeeId };

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.Should().HaveCount(1);
        result[0].EmployeeId.Should().Be(employeeId);
        result[0].RoleId.Should().Be(2);
    }
}

