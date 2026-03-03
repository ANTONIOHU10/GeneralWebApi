using AutoMapper;
using FluentAssertions;
using GeneralWebApi.Application.Features.Permissions.Permissions.Handlers;
using GeneralWebApi.Application.Features.Permissions.Permissions.Queries;
using GeneralWebApi.DTOs.Permissions;
using GeneralWebApi.Integration.Repository.Interfaces;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Permissions;

public sealed class GetPermissionByIdQueryHandlerTests
{
    private readonly Mock<IPermissionRepository> _permissionRepositoryMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly GetPermissionByIdQueryHandler _sut;

    public GetPermissionByIdQueryHandlerTests()
    {
        _permissionRepositoryMock = new Mock<IPermissionRepository>(MockBehavior.Strict);
        _mapperMock = new Mock<IMapper>(MockBehavior.Strict);
        _sut = new GetPermissionByIdQueryHandler(_permissionRepositoryMock.Object, _mapperMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsMappedDto_WhenPermissionExists()
    {
        // Arrange
        const int id = 10;

        var permission = new GeneralWebApi.Domain.Entities.Permissions.Permission
        {
            Id = id,
            Name = "ViewEmployees"
        };

        var dto = new PermissionDto
        {
            Id = id,
            Name = "ViewEmployees"
        };

        _permissionRepositoryMock
            .Setup(r => r.GetByIdAsync(id))
            .ReturnsAsync(permission);

        _mapperMock
            .Setup(m => m.Map<PermissionDto>(permission))
            .Returns(dto);

        var query = new GetPermissionByIdQuery { Id = id };

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(id);
    }

    [Fact]
    public async Task Handle_ThrowsKeyNotFound_WhenPermissionMissing()
    {
        // Arrange
        const int id = 10;

        _permissionRepositoryMock
            .Setup(r => r.GetByIdAsync(id))
            .ReturnsAsync((GeneralWebApi.Domain.Entities.Permissions.Permission?)null);

        var query = new GetPermissionByIdQuery { Id = id };

        // Act
        Func<Task> act = () => _sut.Handle(query, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage($"Permission with ID {id} not found");
    }
}

