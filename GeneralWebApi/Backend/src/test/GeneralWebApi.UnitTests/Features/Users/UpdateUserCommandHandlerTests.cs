using FluentAssertions;
using GeneralWebApi.Application.Features.Users.Commands;
using GeneralWebApi.Application.Features.Users.Handlers;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Users;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Users;

public sealed class UpdateUserCommandHandlerTests
{
    private readonly Mock<IUserService> _userServiceMock;
    private readonly UpdateUserCommandHandler _sut;

    public UpdateUserCommandHandlerTests()
    {
        _userServiceMock = new Mock<IUserService>();
        _sut = new UpdateUserCommandHandler(_userServiceMock.Object);
    }

    [Fact]
    public async Task Handle_UpdatesUser_AndReturnsDto()
    {
        // Arrange
        const int userId = 1;

        var updateRequest = new UpdateUserRequest
        {
            Email = "new@example.com",
            PhoneNumber = "1234567890"
        };

        var updated = new UserWithEmployeeDto
        {
            UserId = 1,
            Username = "user1",
            Email = "new@example.com"
        };

        _userServiceMock
            .Setup(s => s.UpdateAsync(userId, updateRequest, It.IsAny<CancellationToken>()))
            .ReturnsAsync(updated);

        var command = new UpdateUserCommand { UserId = userId, UpdateUserRequest = updateRequest };

        // Act
        var result = await _sut.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeSameAs(updated);
        _userServiceMock.Verify(s => s.UpdateAsync(userId, updateRequest, It.IsAny<CancellationToken>()), Times.Once);
    }
}

