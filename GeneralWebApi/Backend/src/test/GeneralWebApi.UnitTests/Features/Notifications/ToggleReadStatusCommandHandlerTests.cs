using System.Security.Claims;
using FluentAssertions;
using GeneralWebApi.Application.Features.Notifications.Commands;
using GeneralWebApi.Application.Features.Notifications.Handlers;
using GeneralWebApi.Application.Services;
using Microsoft.AspNetCore.Http;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Notifications;

public sealed class ToggleReadStatusCommandHandlerTests
{
    private readonly Mock<INotificationService> _notificationServiceMock;
    private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
    private readonly ToggleReadStatusCommandHandler _sut;

    public ToggleReadStatusCommandHandlerTests()
    {
        _notificationServiceMock = new Mock<INotificationService>();
        _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
        _sut = new ToggleReadStatusCommandHandler(_notificationServiceMock.Object, _httpContextAccessorMock.Object);
    }

    [Fact]
    public async Task Handle_TogglesReadStatus_ForCurrentUser()
    {
        // Arrange
        const string userId = "user-1";
        const int notificationId = 42;

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
            .Setup(s => s.ToggleReadStatusAsync(notificationId, userId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var command = new ToggleReadStatusCommand { NotificationId = notificationId };

        // Act
        await _sut.Handle(command, CancellationToken.None);

        // Assert
        _notificationServiceMock.Verify(s => s.ToggleReadStatusAsync(notificationId, userId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorized_WhenUserIdMissing()
    {
        // Arrange
        _httpContextAccessorMock
            .Setup(a => a.HttpContext)
            .Returns(new DefaultHttpContext());

        var command = new ToggleReadStatusCommand { NotificationId = 42 };

        // Act
        Func<Task> act = () => _sut.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("User ID not found in token");
    }
}

