using System.Security.Claims;
using FluentAssertions;
using GeneralWebApi.Application.Features.Notifications.Commands;
using GeneralWebApi.Application.Features.Notifications.Handlers;
using GeneralWebApi.Application.Services;
using Microsoft.AspNetCore.Http;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Notifications;

public sealed class MarkAllAsReadCommandHandlerTests
{
    private readonly Mock<INotificationService> _notificationServiceMock;
    private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
    private readonly MarkAllAsReadCommandHandler _sut;

    public MarkAllAsReadCommandHandlerTests()
    {
        _notificationServiceMock = new Mock<INotificationService>();
        _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
        _sut = new MarkAllAsReadCommandHandler(_notificationServiceMock.Object, _httpContextAccessorMock.Object);
    }

    [Fact]
    public async Task Handle_MarksAllAsRead_ForCurrentUser()
    {
        // Arrange
        const string userId = "user-1";

        var identity = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId)
        });
        var principal = new ClaimsPrincipal(identity);
        var httpContext = new DefaultHttpContext { User = principal };

        _httpContextAccessorMock
            .Setup(a => a.HttpContext)
            .Returns(httpContext);

        _notificationServiceMock
            .Setup(s => s.MarkAllAsReadAsync(userId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var command = new MarkAllAsReadCommand();

        // Act
        await _sut.Handle(command, CancellationToken.None);

        // Assert
        _notificationServiceMock.Verify(s => s.MarkAllAsReadAsync(userId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorized_WhenUserIdMissing()
    {
        // Arrange
        _httpContextAccessorMock
            .Setup(a => a.HttpContext)
            .Returns(new DefaultHttpContext());

        var command = new MarkAllAsReadCommand();

        // Act
        Func<Task> act = () => _sut.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("User ID not found in token");
    }
}

