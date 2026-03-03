using AutoMapper;
using FluentAssertions;
using GeneralWebApi.Application.Features.Permissions.Permissions.Handlers;
using GeneralWebApi.Application.Features.Permissions.Permissions.Queries;
using GeneralWebApi.DTOs.Permissions;
using GeneralWebApi.Integration.Repository.Interfaces;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Permissions;

public sealed class GetPermissionsByRoleQueryHandlerTests
{
    private readonly Mock<IPermissionRepository> _permissionRepositoryMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly GetPermissionsByRoleQueryHandler _sut;

    public GetPermissionsByRoleQueryHandlerTests()
    {
        _permissionRepositoryMock = new Mock<IPermissionRepository>(MockBehavior.Strict);
        _mapperMock = new Mock<IMapper>(MockBehavior.Strict);
        _sut = new GetPermissionsByRoleQueryHandler(_permissionRepositoryMock.Object, _mapperMock.Object);
    }

    [Fact]
    public async Task Handle_MapsPermissionsAndSetsRoleCount()
    {
        // Arrange
        const int roleId = 5;

        var permissions = new List<GeneralWebApi.Domain.Entities.Permissions.Permission>
        {
            new()
            {
                Id = 1,
                Name = "ViewEmployees",
                RolePermissions = new List<GeneralWebApi.Domain.Entities.Permissions.RolePermission>
                {
                    new() { RoleId = roleId, PermissionId = 1 },
                    new() { RoleId = roleId + 1, PermissionId = 1 }
                }
            },
            new()
            {
                Id = 2,
                Name = "EditEmployees",
                RolePermissions = new List<GeneralWebApi.Domain.Entities.Permissions.RolePermission>
                {
                    new() { RoleId = roleId, PermissionId = 2 }
                }
            }
        };

        _permissionRepositoryMock
            .Setup(r => r.GetByRoleIdAsync(roleId))
            .ReturnsAsync(permissions);

        var mappedDtos = new List<PermissionListDto>
        {
            new() { Id = 1, Name = "ViewEmployees" },
            new() { Id = 2, Name = "EditEmployees" }
        };

        _mapperMock
            .Setup(m => m.Map<List<PermissionListDto>>(permissions))
            .Returns(mappedDtos);

        var query = new GetPermissionsByRoleQuery { RoleId = roleId };

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);
        result[0].RoleCount.Should().Be(2);
        result[1].RoleCount.Should().Be(1);
    }
}

