using System.Security.Claims;
using FluentAssertions;
using GeneralWebApi.Application.Features.Notifications.Commands;
using GeneralWebApi.Application.Features.Notifications.Handlers;
using GeneralWebApi.Application.Services;
using Microsoft.AspNetCore.Http;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Notifications;

public sealed class DeleteNotificationCommandHandlerTests
{
    private readonly Mock<INotificationService> _notificationServiceMock;
    private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
    private readonly DeleteNotificationCommandHandler _sut;

    public DeleteNotificationCommandHandlerTests()
    {
        _notificationServiceMock = new Mock<INotificationService>();
        _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
        _sut = new DeleteNotificationCommandHandler(_notificationServiceMock.Object, _httpContextAccessorMock.Object);
    }

    [Fact]
    public async Task Handle_DeletesNotification_ForCurrentUser()
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
            .Setup(s => s.DeleteAsync(notificationId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var command = new DeleteNotificationCommand { NotificationId = notificationId };

        // Act
        var result = await _sut.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeTrue();
        _notificationServiceMock.Verify(s => s.DeleteAsync(notificationId, userId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorized_WhenUserIdMissing()
    {
        // Arrange
        _httpContextAccessorMock
            .Setup(a => a.HttpContext)
            .Returns(new DefaultHttpContext());

        var command = new DeleteNotificationCommand { NotificationId = 42 };

        // Act
        Func<Task> act = () => _sut.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("User ID not found in token");
    }
}

