using FluentAssertions;
using GeneralWebApi.Application.Features.Positions.Commands;
using GeneralWebApi.Application.Features.Positions.Handlers;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Position;
using GeneralWebApi.UnitTests.Builders;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Positions;

public sealed class UpdatePositionCommandHandlerTests
{
    private readonly Mock<IPositionService> _positionServiceMock;
    private readonly UpdatePositionCommandHandler _sut;

    public UpdatePositionCommandHandlerTests()
    {
        _positionServiceMock = new Mock<IPositionService>();
        _sut = new UpdatePositionCommandHandler(_positionServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsPositionDto_WhenUpdateSucceeds()
    {
        const int positionId = 50;
        var updateDto = new UpdatePositionDtoBuilder().WithId(positionId).WithTitle("Senior").WithCode("SE2").Build();
        var expected = new PositionDtoBuilder().WithId(positionId).WithTitle("Senior").WithCode("SE2").Build();
        _positionServiceMock.Setup(s => s.UpdateAsync(positionId, updateDto, It.IsAny<CancellationToken>())).ReturnsAsync(expected);
        var command = new UpdatePositionCommand { UpdatePositionDto = updateDto };
        var result = await _sut.Handle(command, CancellationToken.None);
        result.Should().NotBeNull().And.BeSameAs(expected);
        result.Id.Should().Be(positionId);
    }

    [Fact]
    public async Task Handle_CallsPositionServiceWithIdAndUpdateDto_WhenInvoked()
    {
        const int positionId = 99;
        var updateDto = new UpdatePositionDtoBuilder().WithId(positionId).WithTitle("Lead").Build();
        var position = new PositionDtoBuilder().WithId(positionId).Build();
        _positionServiceMock.Setup(s => s.UpdateAsync(It.IsAny<int>(), It.IsAny<UpdatePositionDto>(), It.IsAny<CancellationToken>())).ReturnsAsync(position);
        var command = new UpdatePositionCommand { UpdatePositionDto = updateDto };
        await _sut.Handle(command, CancellationToken.None);
        _positionServiceMock.Verify(s => s.UpdateAsync(positionId, It.Is<UpdatePositionDto>(dto => ReferenceEquals(dto, updateDto)), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ForwardsCancellationToken_WhenInvoked()
    {
        var cts = new CancellationTokenSource();
        var token = cts.Token;
        var updateDto = new UpdatePositionDtoBuilder().WithId(1).Build();
        var position = new PositionDtoBuilder().Build();
        _positionServiceMock.Setup(s => s.UpdateAsync(1, It.IsAny<UpdatePositionDto>(), token)).ReturnsAsync(position);
        var command = new UpdatePositionCommand { UpdatePositionDto = updateDto };
        await _sut.Handle(command, token);
        _positionServiceMock.Verify(s => s.UpdateAsync(It.IsAny<int>(), It.IsAny<UpdatePositionDto>(), token), Times.Once);
    }

    [Fact]
    public async Task Handle_PropagatesException_WhenServiceThrows()
    {
        const int positionId = 5;
        var updateDto = new UpdatePositionDtoBuilder().WithId(positionId).Build();
        var command = new UpdatePositionCommand { UpdatePositionDto = updateDto };
        _positionServiceMock.Setup(s => s.UpdateAsync(positionId, updateDto, It.IsAny<CancellationToken>())).ThrowsAsync(new InvalidOperationException("Update failed."));
        Func<Task> act = () => _sut.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("Update failed.");
    }
}
