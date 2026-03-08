using FluentAssertions;
using GeneralWebApi.Application.Features.Positions.Handlers;
using GeneralWebApi.Application.Features.Positions.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Position;
using GeneralWebApi.UnitTests.Builders;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Positions;

public sealed class GetPositionByIdQueryHandlerTests
{
    private readonly Mock<IPositionService> _positionServiceMock;
    private readonly GetPositionByIdQueryHandler _sut;

    public GetPositionByIdQueryHandlerTests()
    {
        _positionServiceMock = new Mock<IPositionService>();
        _sut = new GetPositionByIdQueryHandler(_positionServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsPositionDto_WhenPositionExists()
    {
        const int positionId = 42;
        var expected = new PositionDtoBuilder().WithId(positionId).WithTitle("Lead").WithCode("LE").Build();
        _positionServiceMock.Setup(s => s.GetByIdAsync(positionId, It.IsAny<CancellationToken>())).ReturnsAsync(expected);
        var query = new GetPositionByIdQuery { Id = positionId };
        var result = await _sut.Handle(query, CancellationToken.None);
        result.Should().NotBeNull().And.BeSameAs(expected);
        result.Id.Should().Be(positionId);
    }

    [Fact]
    public async Task Handle_CallsPositionServiceWithRequestId_WhenInvoked()
    {
        const int requestedId = 99;
        var position = new PositionDtoBuilder().WithId(requestedId).Build();
        _positionServiceMock.Setup(s => s.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>())).ReturnsAsync(position);
        var query = new GetPositionByIdQuery { Id = requestedId };
        await _sut.Handle(query, CancellationToken.None);
        _positionServiceMock.Verify(s => s.GetByIdAsync(requestedId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ForwardsCancellationToken_WhenInvoked()
    {
        var cts = new CancellationTokenSource();
        var token = cts.Token;
        var position = new PositionDtoBuilder().Build();
        _positionServiceMock.Setup(s => s.GetByIdAsync(It.IsAny<int>(), token)).ReturnsAsync(position);
        var query = new GetPositionByIdQuery { Id = 1 };
        await _sut.Handle(query, token);
        _positionServiceMock.Verify(s => s.GetByIdAsync(It.IsAny<int>(), token), Times.Once);
    }

    [Fact]
    public async Task Handle_PropagatesException_WhenServiceThrows()
    {
        const int positionId = 5;
        _positionServiceMock.Setup(s => s.GetByIdAsync(positionId, It.IsAny<CancellationToken>())).ThrowsAsync(new InvalidOperationException("Not found."));
        var query = new GetPositionByIdQuery { Id = positionId };
        Func<Task> act = () => _sut.Handle(query, CancellationToken.None);
        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("Not found.");
    }
}
