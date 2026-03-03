using FluentAssertions;
using GeneralWebApi.Application.Features.Notifications.Commands;
using GeneralWebApi.Application.Features.Notifications.Handlers;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Notification;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Notifications;

public sealed class CreateNotificationCommandHandlerTests
{
    private readonly Mock<INotificationService> _notificationServiceMock;
    private readonly CreateNotificationCommandHandler _sut;

    public CreateNotificationCommandHandlerTests()
    {
        _notificationServiceMock = new Mock<INotificationService>();
        _sut = new CreateNotificationCommandHandler(_notificationServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsNotificationDto_WhenCreationSucceeds()
    {
        // Arrange
        var createDto = new CreateNotificationDto
        {
            UserId = "user-1",
            Title = "Test",
            Message = "Message"
        };

        var expected = new NotificationDto
        {
            Id = 10,
            UserId = "user-1",
            Title = "Test",
            Message = "Message"
        };

        _notificationServiceMock
            .Setup(s => s.CreateAsync(createDto, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expected);

        var command = new CreateNotificationCommand { CreateNotificationDto = createDto };

        // Act
        var result = await _sut.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeSameAs(expected);
    }

    [Fact]
    public async Task Handle_ForwardsCancellationToken_ToService()
    {
        // Arrange
        var tokenSource = new CancellationTokenSource();
        var token = tokenSource.Token;

        var createDto = new CreateNotificationDto
        {
            UserId = "user-1",
            Title = "Test",
            Message = "Message"
        };

        var notification = new NotificationDto { Id = 20 };

        _notificationServiceMock
            .Setup(s => s.CreateAsync(createDto, token))
            .ReturnsAsync(notification);

        var command = new CreateNotificationCommand { CreateNotificationDto = createDto };

        // Act
        await _sut.Handle(command, token);

        // Assert
        _notificationServiceMock.Verify(s => s.CreateAsync(createDto, token), Times.Once);
    }
}

