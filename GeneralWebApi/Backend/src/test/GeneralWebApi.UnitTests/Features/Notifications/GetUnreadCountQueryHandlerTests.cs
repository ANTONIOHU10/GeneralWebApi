using System.Security.Claims;
using FluentAssertions;
using GeneralWebApi.Application.Features.Notifications.Handlers;
using GeneralWebApi.Application.Features.Notifications.Queries;
using GeneralWebApi.Application.Services;
using Microsoft.AspNetCore.Http;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Notifications;

public sealed class GetUnreadCountQueryHandlerTests
{
    private readonly Mock<INotificationService> _notificationServiceMock;
    private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
    private readonly GetUnreadCountQueryHandler _sut;

    public GetUnreadCountQueryHandlerTests()
    {
        _notificationServiceMock = new Mock<INotificationService>();
        _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
        _sut = new GetUnreadCountQueryHandler(_notificationServiceMock.Object, _httpContextAccessorMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsUnreadCount_ForCurrentUser()
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
            .Setup(s => s.GetUnreadCountAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(5);

        var query = new GetUnreadCountQuery();

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.Should().Be(5);
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorized_WhenUserIdMissing()
    {
        // Arrange
        _httpContextAccessorMock
            .Setup(a => a.HttpContext)
            .Returns(new DefaultHttpContext());

        var query = new GetUnreadCountQuery();

        // Act
        Func<Task> act = () => _sut.Handle(query, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("User ID not found in token");
    }
}

