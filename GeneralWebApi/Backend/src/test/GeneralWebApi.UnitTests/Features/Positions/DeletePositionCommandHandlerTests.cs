using FluentAssertions;
using GeneralWebApi.Application.Features.Positions.Commands;
using GeneralWebApi.Application.Features.Positions.Handlers;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Position;
using GeneralWebApi.UnitTests.Builders;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Positions;

public sealed class DeletePositionCommandHandlerTests
{
    private readonly Mock<IPositionService> _positionServiceMock;
    private readonly DeletePositionCommandHandler _sut;

    public DeletePositionCommandHandlerTests()
    {
        _positionServiceMock = new Mock<IPositionService>();
        _sut = new DeletePositionCommandHandler(_positionServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsPositionDto_WhenDeleteSucceeds()
    {
        const int positionId = 42;
        var deleted = new PositionDtoBuilder().WithId(positionId).WithTitle("Deleted").WithCode("DEL").Build();
        _positionServiceMock.Setup(s => s.DeleteAsync(positionId, It.IsAny<CancellationToken>())).ReturnsAsync(deleted);
        var command = new DeletePositionCommand { Id = positionId };
        var result = await _sut.Handle(command, CancellationToken.None);
        result.Should().NotBeNull().And.BeSameAs(deleted);
        result.Id.Should().Be(positionId);
    }

    [Fact]
    public async Task Handle_CallsPositionServiceWithCommandId_WhenInvoked()
    {
        const int requestedId = 99;
        var position = new PositionDtoBuilder().WithId(requestedId).Build();
        _positionServiceMock.Setup(s => s.DeleteAsync(It.IsAny<int>(), It.IsAny<CancellationToken>())).ReturnsAsync(position);
        var command = new DeletePositionCommand { Id = requestedId };
        await _sut.Handle(command, CancellationToken.None);
        _positionServiceMock.Verify(s => s.DeleteAsync(requestedId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ForwardsCancellationToken_WhenInvoked()
    {
        var cts = new CancellationTokenSource();
        var token = cts.Token;
        var position = new PositionDtoBuilder().Build();
        _positionServiceMock.Setup(s => s.DeleteAsync(It.IsAny<int>(), token)).ReturnsAsync(position);
        var command = new DeletePositionCommand { Id = 1 };
        await _sut.Handle(command, token);
        _positionServiceMock.Verify(s => s.DeleteAsync(It.IsAny<int>(), token), Times.Once);
    }

    [Fact]
    public async Task Handle_PropagatesException_WhenServiceThrows()
    {
        const int positionId = 5;
        _positionServiceMock.Setup(s => s.DeleteAsync(positionId, It.IsAny<CancellationToken>())).ThrowsAsync(new InvalidOperationException("Delete failed."));
        var command = new DeletePositionCommand { Id = positionId };
        Func<Task> act = () => _sut.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("Delete failed.");
    }
}
