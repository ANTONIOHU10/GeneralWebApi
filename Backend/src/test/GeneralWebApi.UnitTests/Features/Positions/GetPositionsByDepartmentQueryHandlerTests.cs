using FluentAssertions;
using GeneralWebApi.Application.Features.Positions.Handlers;
using GeneralWebApi.Application.Features.Positions.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Position;
using GeneralWebApi.UnitTests.Builders;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Positions;

public sealed class GetPositionsByDepartmentQueryHandlerTests
{
    private readonly Mock<IPositionService> _positionServiceMock;
    private readonly GetPositionsByDepartmentQueryHandler _sut;

    public GetPositionsByDepartmentQueryHandlerTests()
    {
        _positionServiceMock = new Mock<IPositionService>();
        _sut = new GetPositionsByDepartmentQueryHandler(_positionServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsListOfPositionDto_WhenDepartmentHasPositions()
    {
        const int departmentId = 10;
        var items = new List<PositionDto>
        {
            new PositionDtoBuilder().WithId(1).WithTitle("Engineer").WithDepartment(departmentId).Build(),
            new PositionDtoBuilder().WithId(2).WithTitle("Lead").WithDepartment(departmentId).Build()
        };
        _positionServiceMock.Setup(s => s.GetByDepartmentIdAsync(departmentId, It.IsAny<CancellationToken>())).ReturnsAsync(items);
        var query = new GetPositionsByDepartmentQuery { DepartmentId = departmentId };
        var result = await _sut.Handle(query, CancellationToken.None);
        result.Should().NotBeNull().And.HaveCount(2).And.BeSameAs(items);
    }

    [Fact]
    public async Task Handle_CallsPositionServiceWithRequestDepartmentId_WhenInvoked()
    {
        const int departmentId = 99;
        var items = new List<PositionDto>();
        _positionServiceMock.Setup(s => s.GetByDepartmentIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>())).ReturnsAsync(items);
        var query = new GetPositionsByDepartmentQuery { DepartmentId = departmentId };
        await _sut.Handle(query, CancellationToken.None);
        _positionServiceMock.Verify(s => s.GetByDepartmentIdAsync(departmentId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ForwardsCancellationToken_WhenInvoked()
    {
        var cts = new CancellationTokenSource();
        var token = cts.Token;
        var items = new List<PositionDto>();
        _positionServiceMock.Setup(s => s.GetByDepartmentIdAsync(It.IsAny<int>(), token)).ReturnsAsync(items);
        var query = new GetPositionsByDepartmentQuery { DepartmentId = 1 };
        await _sut.Handle(query, token);
        _positionServiceMock.Verify(s => s.GetByDepartmentIdAsync(It.IsAny<int>(), token), Times.Once);
    }

    [Fact]
    public async Task Handle_PropagatesException_WhenServiceThrows()
    {
        const int departmentId = 5;
        _positionServiceMock.Setup(s => s.GetByDepartmentIdAsync(departmentId, It.IsAny<CancellationToken>())).ThrowsAsync(new InvalidOperationException("Department not found."));
        var query = new GetPositionsByDepartmentQuery { DepartmentId = departmentId };
        Func<Task> act = () => _sut.Handle(query, CancellationToken.None);
        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("Department not found.");
    }

    [Fact]
    public async Task Handle_ReturnsEmptyList_WhenDepartmentHasNoPositions()
    {
        const int departmentId = 42;
        var empty = new List<PositionDto>();
        _positionServiceMock.Setup(s => s.GetByDepartmentIdAsync(departmentId, It.IsAny<CancellationToken>())).ReturnsAsync(empty);
        var query = new GetPositionsByDepartmentQuery { DepartmentId = departmentId };
        var result = await _sut.Handle(query, CancellationToken.None);
        result.Should().NotBeNull().And.BeEmpty();
    }
}
