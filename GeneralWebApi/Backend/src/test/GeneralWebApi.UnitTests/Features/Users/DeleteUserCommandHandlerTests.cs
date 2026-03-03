using FluentAssertions;
using GeneralWebApi.Application.Features.Users.Commands;
using GeneralWebApi.Application.Features.Users.Handlers;
using GeneralWebApi.Application.Services;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Users;

public sealed class DeleteUserCommandHandlerTests
{
    private readonly Mock<IUserService> _userServiceMock;
    private readonly DeleteUserCommandHandler _sut;

    public DeleteUserCommandHandlerTests()
    {
        _userServiceMock = new Mock<IUserService>();
        _sut = new DeleteUserCommandHandler(_userServiceMock.Object);
    }

    [Fact]
    public async Task Handle_DeletesUser_AndReturnsTrue()
    {
        // Arrange
        const int userId = 1;

        _userServiceMock
            .Setup(s => s.DeleteAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var command = new DeleteUserCommand { UserId = userId };

        // Act
        var result = await _sut.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeTrue();
        _userServiceMock.Verify(s => s.DeleteAsync(userId, It.IsAny<CancellationToken>()), Times.Once);
    }
}

