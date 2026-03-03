using FluentAssertions;
using GeneralWebApi.Application.Features.Users.Handlers;
using GeneralWebApi.Application.Features.Users.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Users;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Users;

public sealed class GetUserWithEmployeeQueryHandlerTests
{
    private readonly Mock<IUserService> _userServiceMock;
    private readonly GetUserWithEmployeeQueryHandler _sut;

    public GetUserWithEmployeeQueryHandlerTests()
    {
        _userServiceMock = new Mock<IUserService>();
        _sut = new GetUserWithEmployeeQueryHandler(_userServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsUserWithEmployee_FromService()
    {
        // Arrange
        const int userId = 1;

        var dto = new UserWithEmployeeDto
        {
            UserId = userId,
            Username = "user1",
            EmployeeId = 5
        };

        _userServiceMock
            .Setup(s => s.GetUserWithEmployeeAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(dto);

        var query = new GetUserWithEmployeeQuery { UserId = userId };

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeSameAs(dto);
    }
}

