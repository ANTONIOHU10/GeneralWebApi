using FluentAssertions;
using GeneralWebApi.Application.Features.Users.Handlers;
using GeneralWebApi.Application.Features.Users.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Users;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Users;

public sealed class GetUsersWithEmployeeQueryHandlerTests
{
    private readonly Mock<IUserService> _userServiceMock;
    private readonly GetUsersWithEmployeeQueryHandler _sut;

    public GetUsersWithEmployeeQueryHandlerTests()
    {
        _userServiceMock = new Mock<IUserService>();
        _sut = new GetUsersWithEmployeeQueryHandler(_userServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsUsersFromService()
    {
        // Arrange
        var users = new List<UserWithEmployeeDto>
        {
            new() { UserId = 1, Username = "user1", EmployeeId = 1 },
            new() { UserId = 2, Username = "user2", EmployeeId = 2 }
        };

        _userServiceMock
            .Setup(s => s.GetUsersWithEmployeeAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(users);

        var query = new GetUsersWithEmployeeQuery();

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeSameAs(users);
        result.Should().HaveCount(2);
    }
}

