using System.Security.Claims;
using FluentAssertions;
using GeneralWebApi.Application.Features.Tasks.Handlers;
using GeneralWebApi.Application.Features.Tasks.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Task;
using Microsoft.AspNetCore.Http;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Tasks;

public sealed class GetTasksQueryHandlerTests
{
    private readonly Mock<ITaskService> _taskServiceMock;
    private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
    private readonly GetTasksQueryHandler _sut;

    public GetTasksQueryHandlerTests()
    {
        _taskServiceMock = new Mock<ITaskService>();
        _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
        _sut = new GetTasksQueryHandler(_taskServiceMock.Object, _httpContextAccessorMock.Object);
    }

    [Fact]
    public async Task Handle_UsesCurrentUserId_AndSearchDto_WhenProvided()
    {
        // Arrange
        const string userId = "user-123";

        var claimsIdentity = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId)
        });
        var principal = new ClaimsPrincipal(claimsIdentity);
        var httpContext = new DefaultHttpContext { User = principal };

        _httpContextAccessorMock
            .Setup(a => a.HttpContext)
            .Returns(httpContext);

        var searchDto = new TaskSearchDto
        {
            PageNumber = 2,
            PageSize = 50
        };

        var pagedResult = new PagedResult<TaskListDto>
        {
            PageNumber = 2,
            PageSize = 50,
            TotalCount = 0,
            Items = new List<TaskListDto>()
        };

        _taskServiceMock
            .Setup(s => s.GetPagedAsync(searchDto, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(pagedResult);

        var query = new GetTasksQuery { SearchDto = searchDto };

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeSameAs(pagedResult);
        _taskServiceMock.Verify(s => s.GetPagedAsync(searchDto, userId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorized_WhenUserIdMissing()
    {
        // Arrange
        _httpContextAccessorMock
            .Setup(a => a.HttpContext)
            .Returns(new DefaultHttpContext());

        var query = new GetTasksQuery { SearchDto = null };

        // Act
        Func<Task> act = () => _sut.Handle(query, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("User ID not found in token");
    }
}

