using System.Security.Claims;
using FluentAssertions;
using GeneralWebApi.Application.Features.Tasks.Commands;
using GeneralWebApi.Application.Features.Tasks.Handlers;
using GeneralWebApi.Application.Services;
using Microsoft.AspNetCore.Http;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Tasks;

public sealed class DeleteTaskCommandHandlerTests
{
    private readonly Mock<ITaskService> _taskServiceMock;
    private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
    private readonly DeleteTaskCommandHandler _sut;

    public DeleteTaskCommandHandlerTests()
    {
        _taskServiceMock = new Mock<ITaskService>();
        _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
        _sut = new DeleteTaskCommandHandler(_taskServiceMock.Object, _httpContextAccessorMock.Object);
    }

    [Fact]
    public async Task Handle_DeletesTask_ForCurrentUser()
    {
        // Arrange
        const string userId = "user-1";
        const int taskId = 10;

        var identity = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId)
        });
        var principal = new ClaimsPrincipal(identity);
        var httpContext = new DefaultHttpContext { User = principal };

        _httpContextAccessorMock
            .Setup(a => a.HttpContext)
            .Returns(httpContext);

        _taskServiceMock
            .Setup(s => s.DeleteAsync(taskId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var command = new DeleteTaskCommand { Id = taskId };

        // Act
        var result = await _sut.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeTrue();
        _taskServiceMock.Verify(s => s.DeleteAsync(taskId, userId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorized_WhenUserIdMissing()
    {
        // Arrange
        _httpContextAccessorMock
            .Setup(a => a.HttpContext)
            .Returns(new DefaultHttpContext());

        var command = new DeleteTaskCommand { Id = 10 };

        // Act
        Func<Task> act = () => _sut.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("User ID not found in token");
    }
}

