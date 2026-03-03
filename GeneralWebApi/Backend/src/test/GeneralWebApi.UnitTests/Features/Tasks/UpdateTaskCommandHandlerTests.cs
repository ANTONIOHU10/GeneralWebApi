using System.Security.Claims;
using FluentAssertions;
using GeneralWebApi.Application.Features.Tasks.Commands;
using GeneralWebApi.Application.Features.Tasks.Handlers;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Task;
using Microsoft.AspNetCore.Http;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Tasks;

public sealed class UpdateTaskCommandHandlerTests
{
    private readonly Mock<ITaskService> _taskServiceMock;
    private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
    private readonly UpdateTaskCommandHandler _sut;

    public UpdateTaskCommandHandlerTests()
    {
        _taskServiceMock = new Mock<ITaskService>();
        _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
        _sut = new UpdateTaskCommandHandler(_taskServiceMock.Object, _httpContextAccessorMock.Object);
    }

    [Fact]
    public async Task Handle_UpdatesTask_ForCurrentUser()
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

        var updateDto = new UpdateTaskDto
        {
            Id = 10,
            Title = "Updated task"
        };

        var updated = new TaskDto { Id = 10, Title = "Updated task", UserId = userId };

        _taskServiceMock
            .Setup(s => s.UpdateAsync(updateDto.Id, updateDto, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(updated);

        var command = new UpdateTaskCommand { UpdateTaskDto = updateDto };

        // Act
        var result = await _sut.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeSameAs(updated);
        _taskServiceMock.Verify(s => s.UpdateAsync(updateDto.Id, updateDto, userId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorized_WhenUserIdMissing()
    {
        // Arrange
        _httpContextAccessorMock
            .Setup(a => a.HttpContext)
            .Returns(new DefaultHttpContext());

        var command = new UpdateTaskCommand
        {
            UpdateTaskDto = new UpdateTaskDto { Id = 10 }
        };

        // Act
        Func<Task> act = () => _sut.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("User ID not found in token");
    }
}

