using System.Security.Claims;
using FluentAssertions;
using GeneralWebApi.Application.Features.Tasks.Commands;
using GeneralWebApi.Application.Features.Tasks.Handlers;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Task;
using Microsoft.AspNetCore.Http;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Tasks;

public sealed class CreateTaskCommandHandlerTests
{
    private readonly Mock<ITaskService> _taskServiceMock;
    private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
    private readonly CreateTaskCommandHandler _sut;

    public CreateTaskCommandHandlerTests()
    {
        _taskServiceMock = new Mock<ITaskService>();
        _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
        _sut = new CreateTaskCommandHandler(_taskServiceMock.Object, _httpContextAccessorMock.Object);
    }

    [Fact]
    public async Task Handle_CallsServiceWithCurrentUserId()
    {
        // Arrange
        const string userId = "user-123";

        var identity = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId)
        });
        var principal = new ClaimsPrincipal(identity);
        var httpContext = new DefaultHttpContext { User = principal };

        _httpContextAccessorMock
            .Setup(a => a.HttpContext)
            .Returns(httpContext);

        var createDto = new CreateTaskDto
        {
            Title = "Task title",
            Description = "Task description"
        };

        var expected = new TaskDto { Id = 10, Title = "Task title" };

        _taskServiceMock
            .Setup(s => s.CreateAsync(createDto, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expected);

        var command = new CreateTaskCommand { CreateTaskDto = createDto };

        // Act
        var result = await _sut.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeSameAs(expected);
        _taskServiceMock.Verify(s => s.CreateAsync(createDto, userId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorized_WhenUserIdMissing()
    {
        // Arrange
        _httpContextAccessorMock
            .Setup(a => a.HttpContext)
            .Returns(new DefaultHttpContext());

        var command = new CreateTaskCommand
        {
            CreateTaskDto = new CreateTaskDto { Title = "Task" }
        };

        // Act
        Func<Task> act = () => _sut.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("User ID not found in token");
    }
}

