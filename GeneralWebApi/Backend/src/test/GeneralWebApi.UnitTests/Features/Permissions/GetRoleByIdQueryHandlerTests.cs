using AutoMapper;
using FluentAssertions;
using GeneralWebApi.Application.Features.Permissions.Roles.Handlers;
using GeneralWebApi.Application.Features.Permissions.Roles.Queries;
using GeneralWebApi.DTOs.Permissions;
using GeneralWebApi.Integration.Repository.Interfaces;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Permissions;

public sealed class GetRoleByIdQueryHandlerTests
{
    private readonly Mock<IRoleRepository> _roleRepositoryMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly GetRoleByIdQueryHandler _sut;

    public GetRoleByIdQueryHandlerTests()
    {
        _roleRepositoryMock = new Mock<IRoleRepository>(MockBehavior.Strict);
        _mapperMock = new Mock<IMapper>(MockBehavior.Strict);
        _sut = new GetRoleByIdQueryHandler(_roleRepositoryMock.Object, _mapperMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsMappedDto_WithEmployeeCount_WhenRoleExists()
    {
        // Arrange
        const int roleId = 10;
        var role = new GeneralWebApi.Domain.Entities.Permissions.Role
        {
            Id = roleId,
            Name = "Manager"
        };

        var dto = new RoleDto
        {
            Id = roleId,
            Name = "Manager"
        };

        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(roleId))
            .ReturnsAsync(role);

        _mapperMock
            .Setup(m => m.Map<RoleDto>(role))
            .Returns(dto);

        _roleRepositoryMock
            .Setup(r => r.GetEmployeeCountAsync(roleId))
            .ReturnsAsync(7);

        var query = new GetRoleByIdQuery { Id = roleId };

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(roleId);
        result.EmployeeCount.Should().Be(7);
    }

    [Fact]
    public async Task Handle_ThrowsKeyNotFound_WhenRoleDoesNotExist()
    {
        // Arrange
        const int roleId = 99;

        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(roleId))
            .ReturnsAsync((GeneralWebApi.Domain.Entities.Permissions.Role?)null);

        var query = new GetRoleByIdQuery { Id = roleId };

        // Act
        Func<Task> act = () => _sut.Handle(query, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage($"Role with ID {roleId} not found");
    }
}

