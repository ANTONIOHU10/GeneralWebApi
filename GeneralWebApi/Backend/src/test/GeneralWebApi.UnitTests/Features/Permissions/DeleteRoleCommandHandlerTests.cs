using FluentAssertions;
using GeneralWebApi.Application.Features.Permissions.Roles.Commands;
using GeneralWebApi.Application.Features.Permissions.Roles.Handlers;
using GeneralWebApi.Integration.Repository.Interfaces;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Permissions;

public sealed class DeleteRoleCommandHandlerTests
{
    private readonly Mock<IRoleRepository> _roleRepositoryMock;
    private readonly Mock<IEmployeeRoleRepository> _employeeRoleRepositoryMock;
    private readonly Mock<IRolePermissionRepository> _rolePermissionRepositoryMock;
    private readonly DeleteRoleCommandHandler _sut;

    public DeleteRoleCommandHandlerTests()
    {
        _roleRepositoryMock = new Mock<IRoleRepository>(MockBehavior.Strict);
        _employeeRoleRepositoryMock = new Mock<IEmployeeRoleRepository>(MockBehavior.Strict);
        _rolePermissionRepositoryMock = new Mock<IRolePermissionRepository>(MockBehavior.Strict);

        _sut = new DeleteRoleCommandHandler(
            _roleRepositoryMock.Object,
            _employeeRoleRepositoryMock.Object,
            _rolePermissionRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_Throws_WhenRoleDoesNotExist()
    {
        // Arrange
        var command = new DeleteRoleCommand { Id = 1 };

        _roleRepositoryMock
            .Setup(r => r.ExistsAsync(command.Id))
            .ReturnsAsync(false);

        // Act
        Func<Task> act = () => _sut.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage($"Role with ID {command.Id} not found");
    }

    [Fact]
    public async Task Handle_Throws_WhenRoleAssignedToEmployees()
    {
        // Arrange
        var command = new DeleteRoleCommand { Id = 1 };

        _roleRepositoryMock
            .Setup(r => r.ExistsAsync(command.Id))
            .ReturnsAsync(true);

        var employeeRoles = new List<GeneralWebApi.Domain.Entities.Permissions.EmployeeRole>
        {
            new() { Id = 1, RoleId = 1, EmployeeId = 10 }
        };

        _employeeRoleRepositoryMock
            .Setup(r => r.GetByRoleIdAsync(command.Id))
            .ReturnsAsync(employeeRoles);

        // Act
        Func<Task> act = () => _sut.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage($"Cannot delete role with ID {command.Id} because it is assigned to {employeeRoles.Count} employee(s).");
    }
}

