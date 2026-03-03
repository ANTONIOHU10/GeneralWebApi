using AutoMapper;
using FluentAssertions;
using GeneralWebApi.Application.Features.Permissions.Permissions.Commands;
using GeneralWebApi.Application.Features.Permissions.Permissions.Handlers;
using GeneralWebApi.DTOs.Permissions;
using GeneralWebApi.Integration.Repository.Interfaces;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Permissions;

public sealed class UpdatePermissionCommandHandlerTests
{
    private readonly Mock<IPermissionRepository> _permissionRepositoryMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly UpdatePermissionCommandHandler _sut;

    public UpdatePermissionCommandHandlerTests()
    {
        _permissionRepositoryMock = new Mock<IPermissionRepository>(MockBehavior.Strict);
        _mapperMock = new Mock<IMapper>(MockBehavior.Strict);
        _sut = new UpdatePermissionCommandHandler(_permissionRepositoryMock.Object, _mapperMock.Object);
    }

    [Fact]
    public async Task Handle_Throws_WhenPermissionNotFound()
    {
        // Arrange
        var dto = new UpdatePermissionDto { Name = "ViewEmployees" };
        var command = new UpdatePermissionCommand { Id = 1, UpdatePermissionDto = dto };

        _permissionRepositoryMock
            .Setup(r => r.GetByIdAsync(command.Id))
            .ReturnsAsync((GeneralWebApi.Domain.Entities.Permissions.Permission?)null);

        // Act
        Func<Task> act = () => _sut.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage($"Permission with ID {command.Id} not found.");
    }

    [Fact]
    public async Task Handle_Throws_WhenNameAlreadyExistsOnAnotherPermission()
    {
        // Arrange
        var existing = new GeneralWebApi.Domain.Entities.Permissions.Permission
        {
            Id = 1,
            Name = "OldName"
        };

        var other = new GeneralWebApi.Domain.Entities.Permissions.Permission
        {
            Id = 2,
            Name = "NewName"
        };

        var dto = new UpdatePermissionDto { Name = "NewName" };
        var command = new UpdatePermissionCommand { Id = 1, UpdatePermissionDto = dto };

        _permissionRepositoryMock
            .Setup(r => r.GetByIdAsync(command.Id))
            .ReturnsAsync(existing);

        _permissionRepositoryMock
            .Setup(r => r.GetByNameAsync(dto.Name))
            .ReturnsAsync(other);

        // Act
        Func<Task> act = () => _sut.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage($"Permission with name '{dto.Name}' already exists.");
    }
}

