using AutoMapper;
using FluentAssertions;
using GeneralWebApi.Application.Features.Permissions.Permissions.Commands;
using GeneralWebApi.Application.Features.Permissions.Permissions.Handlers;
using GeneralWebApi.DTOs.Permissions;
using GeneralWebApi.Integration.Repository.Interfaces;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Permissions;

public sealed class CreatePermissionCommandHandlerTests
{
    private readonly Mock<IPermissionRepository> _permissionRepositoryMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly CreatePermissionCommandHandler _sut;

    public CreatePermissionCommandHandlerTests()
    {
        _permissionRepositoryMock = new Mock<IPermissionRepository>(MockBehavior.Strict);
        _mapperMock = new Mock<IMapper>(MockBehavior.Strict);
        _sut = new CreatePermissionCommandHandler(_permissionRepositoryMock.Object, _mapperMock.Object);
    }

    [Fact]
    public async Task Handle_Throws_WhenNameAlreadyExists()
    {
        // Arrange
        var dto = new CreatePermissionDto { Name = "ViewEmployees" };
        var command = new CreatePermissionCommand { CreatePermissionDto = dto };

        _permissionRepositoryMock
            .Setup(r => r.ExistsByNameAsync(dto.Name))
            .ReturnsAsync(true);

        // Act
        Func<Task> act = () => _sut.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage($"Permission with name '{dto.Name}' already exists.");
    }
}

