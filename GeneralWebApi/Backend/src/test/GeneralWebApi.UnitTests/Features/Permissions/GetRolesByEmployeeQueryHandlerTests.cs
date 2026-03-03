using AutoMapper;
using FluentAssertions;
using GeneralWebApi.Application.Features.Permissions.Roles.Handlers;
using GeneralWebApi.Application.Features.Permissions.Roles.Queries;
using GeneralWebApi.DTOs.Permissions;
using GeneralWebApi.Integration.Repository.Interfaces;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Permissions;

public sealed class GetRolesByEmployeeQueryHandlerTests
{
    private readonly Mock<IRoleRepository> _roleRepositoryMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly GetRolesByEmployeeQueryHandler _sut;

    public GetRolesByEmployeeQueryHandlerTests()
    {
        _roleRepositoryMock = new Mock<IRoleRepository>(MockBehavior.Strict);
        _mapperMock = new Mock<IMapper>(MockBehavior.Strict);
        _sut = new GetRolesByEmployeeQueryHandler(_roleRepositoryMock.Object, _mapperMock.Object);
    }

    [Fact]
    public async Task Handle_MapsRolesAndSetsEmployeeCount()
    {
        // Arrange
        const int employeeId = 10;

        var roles = new List<GeneralWebApi.Domain.Entities.Permissions.Role>
        {
            new() { Id = 1, Name = "Admin" },
            new() { Id = 2, Name = "User" }
        };

        _roleRepositoryMock
            .Setup(r => r.GetByEmployeeIdAsync(employeeId))
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
            .Setup(r => r.GetEmployeeCountAsync(1))
            .ReturnsAsync(5);

        _roleRepositoryMock
            .Setup(r => r.GetEmployeeCountAsync(2))
            .ReturnsAsync(3);

        var query = new GetRolesByEmployeeQuery { EmployeeId = employeeId };

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);
        result[0].EmployeeCount.Should().Be(5);
        result[1].EmployeeCount.Should().Be(3);
    }
}

