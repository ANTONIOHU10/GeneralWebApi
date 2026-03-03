using System.Security.Claims;
using FluentAssertions;
using GeneralWebApi.Application.Features.Tasks.Handlers;
using GeneralWebApi.Application.Features.Tasks.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Task;
using Microsoft.AspNetCore.Http;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Tasks;

public sealed class GetTaskByIdQueryHandlerTests
{
    private readonly Mock<ITaskService> _taskServiceMock;
    private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
    private readonly GetTaskByIdQueryHandler _sut;

    public GetTaskByIdQueryHandlerTests()
    {
        _taskServiceMock = new Mock<ITaskService>();
        _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
        _sut = new GetTaskByIdQueryHandler(_taskServiceMock.Object, _httpContextAccessorMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsTask_ForCurrentUser()
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

        var taskDto = new TaskDto { Id = taskId, UserId = userId, Title = "Test task" };

        _taskServiceMock
            .Setup(s => s.GetByIdAsync(taskId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(taskDto);

        var query = new GetTaskByIdQuery { Id = taskId };

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeSameAs(taskDto);
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorized_WhenUserIdMissing()
    {
        // Arrange
        _httpContextAccessorMock
            .Setup(a => a.HttpContext)
            .Returns(new DefaultHttpContext());

        var query = new GetTaskByIdQuery { Id = 10 };

        // Act
        Func<Task> act = () => _sut.Handle(query, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("User ID not found in token");
    }
}

