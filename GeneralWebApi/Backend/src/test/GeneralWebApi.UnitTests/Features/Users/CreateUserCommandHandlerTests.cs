using FluentAssertions;
using GeneralWebApi.Application.Features.Users.Commands;
using GeneralWebApi.Application.Features.Users.Handlers;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Users;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Users;

public sealed class CreateUserCommandHandlerTests
{
    private readonly Mock<IUserService> _userServiceMock;
    private readonly CreateUserCommandHandler _sut;

    public CreateUserCommandHandlerTests()
    {
        _userServiceMock = new Mock<IUserService>();
        _sut = new CreateUserCommandHandler(_userServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsCreatedUser_WhenServiceSucceeds()
    {
        // Arrange
        var request = new CreateUserRequest
        {
            Username = "test.user",
            Email = "test.user@example.com",
            Password = "P@ssw0rd!"
        };

        var expected = new UserWithEmployeeDto
        {
            UserId = 1,
            Username = "test.user",
            Email = "test.user@example.com"
        };

        _userServiceMock
            .Setup(s => s.CreateAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expected);

        var command = new CreateUserCommand { CreateUserRequest = request };

        // Act
        var result = await _sut.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeSameAs(expected);
    }
}

