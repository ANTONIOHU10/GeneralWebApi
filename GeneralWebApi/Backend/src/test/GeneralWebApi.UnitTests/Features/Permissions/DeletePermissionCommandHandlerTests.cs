using FluentAssertions;
using GeneralWebApi.Application.Features.Permissions.Permissions.Commands;
using GeneralWebApi.Application.Features.Permissions.Permissions.Handlers;
using GeneralWebApi.Integration.Repository.Interfaces;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Permissions;

public sealed class DeletePermissionCommandHandlerTests
{
    private readonly Mock<IPermissionRepository> _permissionRepositoryMock;
    private readonly Mock<IRolePermissionRepository> _rolePermissionRepositoryMock;
    private readonly DeletePermissionCommandHandler _sut;

    public DeletePermissionCommandHandlerTests()
    {
        _permissionRepositoryMock = new Mock<IPermissionRepository>(MockBehavior.Strict);
        _rolePermissionRepositoryMock = new Mock<IRolePermissionRepository>(MockBehavior.Strict);
        _sut = new DeletePermissionCommandHandler(_permissionRepositoryMock.Object, _rolePermissionRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_Throws_WhenPermissionDoesNotExist()
    {
        // Arrange
        var command = new DeletePermissionCommand { Id = 1 };

        _permissionRepositoryMock
            .Setup(r => r.ExistsAsync(command.Id))
            .ReturnsAsync(false);

        // Act
        Func<Task> act = () => _sut.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage($"Permission with ID {command.Id} not found");
    }

    [Fact]
    public async Task Handle_Throws_WhenPermissionAssignedToRoles()
    {
        // Arrange
        var command = new DeletePermissionCommand { Id = 1 };

        _permissionRepositoryMock
            .Setup(r => r.ExistsAsync(command.Id))
            .ReturnsAsync(true);

        var rolePermissions = new List<GeneralWebApi.Domain.Entities.Permissions.RolePermission>
        {
            new() { Id = 1, RoleId = 10, PermissionId = 1 }
        };

        _rolePermissionRepositoryMock
            .Setup(r => r.GetByPermissionIdAsync(command.Id))
            .ReturnsAsync(rolePermissions);

        // Act
        Func<Task> act = () => _sut.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage($"Cannot delete permission with ID {command.Id} because it is assigned to {rolePermissions.Count} role(s).");
    }
}

