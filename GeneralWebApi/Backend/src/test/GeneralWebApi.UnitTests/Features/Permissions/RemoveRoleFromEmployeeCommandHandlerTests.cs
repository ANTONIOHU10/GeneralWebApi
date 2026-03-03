using FluentAssertions;
using GeneralWebApi.Application.Features.Permissions.Roles.Commands;
using GeneralWebApi.Application.Features.Permissions.Roles.Handlers;
using GeneralWebApi.Integration.Repository.Interfaces;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Permissions;

public sealed class RemoveRoleFromEmployeeCommandHandlerTests
{
    private readonly Mock<IEmployeeRoleRepository> _employeeRoleRepositoryMock;
    private readonly RemoveRoleFromEmployeeCommandHandler _sut;

    public RemoveRoleFromEmployeeCommandHandlerTests()
    {
        _employeeRoleRepositoryMock = new Mock<IEmployeeRoleRepository>(MockBehavior.Strict);
        _sut = new RemoveRoleFromEmployeeCommandHandler(_employeeRoleRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_Throws_WhenAssignmentDoesNotExist()
    {
        // Arrange
        var command = new RemoveRoleFromEmployeeCommand
        {
            EmployeeId = 1,
            RoleId = 2
        };

        _employeeRoleRepositoryMock
            .Setup(r => r.ExistsByEmployeeAndRoleAsync(command.EmployeeId, command.RoleId))
            .ReturnsAsync(false);

        // Act
        Func<Task> act = () => _sut.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage($"Role assignment not found for employee ID {command.EmployeeId} and role ID {command.RoleId}");
    }
}

