using AutoMapper;
using FluentAssertions;
using GeneralWebApi.Application.Features.Permissions.Permissions.Handlers;
using GeneralWebApi.Application.Features.Permissions.Permissions.Queries;
using GeneralWebApi.DTOs.Permissions;
using GeneralWebApi.Integration.Repository.Interfaces;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Permissions;

public sealed class GetPermissionsQueryHandlerTests
{
    private readonly Mock<IPermissionRepository> _permissionRepositoryMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly GetPermissionsQueryHandler _sut;

    public GetPermissionsQueryHandlerTests()
    {
        _permissionRepositoryMock = new Mock<IPermissionRepository>(MockBehavior.Strict);
        _mapperMock = new Mock<IMapper>(MockBehavior.Strict);
        _sut = new GetPermissionsQueryHandler(_permissionRepositoryMock.Object, _mapperMock.Object);
    }

    [Fact]
    public async Task Handle_UsesGetAll_WhenSearchDtoIsNull()
    {
        // Arrange
        var permissions = new List<GeneralWebApi.Domain.Entities.Permissions.Permission>
        {
            new()
            {
                Id = 1,
                Name = "ViewEmployees",
                RolePermissions = new List<GeneralWebApi.Domain.Entities.Permissions.RolePermission>
                {
                    new() { RoleId = 1, PermissionId = 1 }
                }
            }
        };

        _permissionRepositoryMock
            .Setup(r => r.GetAllAsync())
            .ReturnsAsync(permissions);

        var mappedDtos = new List<PermissionListDto>
        {
            new() { Id = 1, Name = "ViewEmployees" }
        };

        _mapperMock
            .Setup(m => m.Map<List<PermissionListDto>>(permissions))
            .Returns(mappedDtos);

        var query = new GetPermissionsQuery { SearchDto = null };

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.Should().HaveCount(1);
        result[0].RoleCount.Should().Be(1);

        _permissionRepositoryMock.Verify(r => r.GetAllAsync(), Times.Once);
        _permissionRepositoryMock.Verify(r => r.SearchAsync(
            It.IsAny<string?>(),
            It.IsAny<string?>(),
            It.IsAny<string?>(),
            It.IsAny<string?>(),
            It.IsAny<DateTime?>(),
            It.IsAny<DateTime?>(),
            It.IsAny<string?>(),
            It.IsAny<bool>(),
            It.IsAny<int>(),
            It.IsAny<int>()), Times.Never);
    }
}

