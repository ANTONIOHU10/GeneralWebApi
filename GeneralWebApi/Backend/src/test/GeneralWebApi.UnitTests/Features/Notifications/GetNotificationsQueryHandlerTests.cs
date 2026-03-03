using System.Security.Claims;
using FluentAssertions;
using GeneralWebApi.Application.Features.Notifications.Handlers;
using GeneralWebApi.Application.Features.Notifications.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Notification;
using Microsoft.AspNetCore.Http;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Notifications;

public sealed class GetNotificationsQueryHandlerTests
{
    private readonly Mock<INotificationService> _notificationServiceMock;
    private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
    private readonly GetNotificationsQueryHandler _sut;

    public GetNotificationsQueryHandlerTests()
    {
        _notificationServiceMock = new Mock<INotificationService>();
        _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
        _sut = new GetNotificationsQueryHandler(_notificationServiceMock.Object, _httpContextAccessorMock.Object);
    }

    [Fact]
    public async Task Handle_UsesSearchDto_WhenProvided()
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

        var searchDto = new NotificationSearchDto
        {
            PageNumber = 2,
            PageSize = 50
        };

        var paged = new PagedResult<NotificationListDto>
        {
            PageNumber = 2,
            PageSize = 50,
            Items = new List<NotificationListDto>()
        };

        _notificationServiceMock
            .Setup(s => s.GetPagedAsync(searchDto, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(paged);

        var query = new GetNotificationsQuery { SearchDto = searchDto };

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeSameAs(paged);
        _notificationServiceMock.Verify(s => s.GetPagedAsync(searchDto, userId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_UsesDefaultSearch_WhenNull()
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

        NotificationSearchDto? capturedSearch = null;

        _notificationServiceMock
            .Setup(s => s.GetPagedAsync(It.IsAny<NotificationSearchDto>(), userId, It.IsAny<CancellationToken>()))
            .Callback<NotificationSearchDto, string, CancellationToken>((sDto, _, _) => capturedSearch = sDto)
            .ReturnsAsync(new PagedResult<NotificationListDto>());

        var query = new GetNotificationsQuery { SearchDto = null };

        // Act
        await _sut.Handle(query, CancellationToken.None);

        // Assert
        capturedSearch.Should().NotBeNull();
        capturedSearch!.PageNumber.Should().Be(1);
        capturedSearch.PageSize.Should().Be(20);
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorized_WhenUserIdMissing()
    {
        // Arrange
        _httpContextAccessorMock
            .Setup(a => a.HttpContext)
            .Returns(new DefaultHttpContext());

        var query = new GetNotificationsQuery();

        // Act
        Func<Task> act = () => _sut.Handle(query, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("User ID not found in token");
    }
}

