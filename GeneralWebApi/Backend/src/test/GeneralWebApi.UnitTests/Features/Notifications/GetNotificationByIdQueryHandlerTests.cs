using System.Security.Claims;
using FluentAssertions;
using GeneralWebApi.Application.Features.Notifications.Handlers;
using GeneralWebApi.Application.Features.Notifications.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Notification;
using Microsoft.AspNetCore.Http;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Notifications;

public sealed class GetNotificationByIdQueryHandlerTests
{
    private readonly Mock<INotificationService> _notificationServiceMock;
    private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
    private readonly GetNotificationByIdQueryHandler _sut;

    public GetNotificationByIdQueryHandlerTests()
    {
        _notificationServiceMock = new Mock<INotificationService>();
        _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
        _sut = new GetNotificationByIdQueryHandler(_notificationServiceMock.Object, _httpContextAccessorMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsNotification_ForCurrentUser()
    {
        // Arrange
        const string userId = "user-1";
        const int id = 10;

        var identity = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId)
        });
        var principal = new ClaimsPrincipal(identity);
        var httpContext = new DefaultHttpContext { User = principal };

        _httpContextAccessorMock
            .Setup(a => a.HttpContext)
            .Returns(httpContext);

        var notification = new NotificationDto { Id = id, UserId = userId };

        _notificationServiceMock
            .Setup(s => s.GetByIdAsync(id, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(notification);

        var query = new GetNotificationByIdQuery { Id = id };

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeSameAs(notification);
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorized_WhenUserIdMissing()
    {
        // Arrange
        _httpContextAccessorMock
            .Setup(a => a.HttpContext)
            .Returns(new DefaultHttpContext());

        var query = new GetNotificationByIdQuery { Id = 10 };

        // Act
        Func<Task> act = () => _sut.Handle(query, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("User ID not found in token");
    }
}

