using AutoMapper;
using FluentAssertions;
using GeneralWebApi.Application.Features.Permissions.Roles.Commands;
using GeneralWebApi.Application.Features.Permissions.Roles.Handlers;
using GeneralWebApi.DTOs.Permissions;
using GeneralWebApi.Integration.Repository.Interfaces;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Permissions;

public sealed class UpdateRoleCommandHandlerTests
{
    private readonly Mock<IRoleRepository> _roleRepositoryMock;
    private readonly Mock<IPermissionRepository> _permissionRepositoryMock;
    private readonly Mock<IRolePermissionRepository> _rolePermissionRepositoryMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly UpdateRoleCommandHandler _sut;

    public UpdateRoleCommandHandlerTests()
    {
        _roleRepositoryMock = new Mock<IRoleRepository>(MockBehavior.Strict);
        _permissionRepositoryMock = new Mock<IPermissionRepository>(MockBehavior.Strict);
        _rolePermissionRepositoryMock = new Mock<IRolePermissionRepository>(MockBehavior.Strict);
        _mapperMock = new Mock<IMapper>(MockBehavior.Strict);

        _sut = new UpdateRoleCommandHandler(
            _roleRepositoryMock.Object,
            _permissionRepositoryMock.Object,
            _rolePermissionRepositoryMock.Object,
            _mapperMock.Object);
    }

    [Fact]
    public async Task Handle_Throws_WhenRoleNotFound()
    {
        // Arrange
        var dto = new UpdateRoleDto { Name = "NewName" };
        var command = new UpdateRoleCommand { Id = 1, UpdateRoleDto = dto };

        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(command.Id))
            .ReturnsAsync((GeneralWebApi.Domain.Entities.Permissions.Role?)null);

        // Act
        Func<Task> act = () => _sut.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage($"Role with ID {command.Id} not found.");
    }

    [Fact]
    public async Task Handle_Throws_WhenNameAlreadyExistsOnAnotherRole()
    {
        // Arrange
        var existingRole = new GeneralWebApi.Domain.Entities.Permissions.Role
        {
            Id = 1,
            Name = "OldName"
        };

        var otherRoleWithSameName = new GeneralWebApi.Domain.Entities.Permissions.Role
        {
            Id = 2,
            Name = "NewName"
        };

        var dto = new UpdateRoleDto { Name = "NewName" };
        var command = new UpdateRoleCommand { Id = 1, UpdateRoleDto = dto };

        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(command.Id))
            .ReturnsAsync(existingRole);

        _roleRepositoryMock
            .Setup(r => r.GetByNameAsync(dto.Name))
            .ReturnsAsync(otherRoleWithSameName);

        // Act
        Func<Task> act = () => _sut.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage($"Role with name '{dto.Name}' already exists.");
    }
}

