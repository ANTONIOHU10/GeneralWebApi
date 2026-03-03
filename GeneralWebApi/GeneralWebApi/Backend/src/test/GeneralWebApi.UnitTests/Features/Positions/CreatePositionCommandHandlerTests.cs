using FluentAssertions;
using GeneralWebApi.Application.Features.Positions.Commands;
using GeneralWebApi.Application.Features.Positions.Handlers;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Position;
using GeneralWebApi.UnitTests.Builders;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Positions;

public sealed class CreatePositionCommandHandlerTests
{
    private readonly Mock<IPositionService> _positionServiceMock;
    private readonly CreatePositionCommandHandler _sut;

    public CreatePositionCommandHandlerTests()
    {
        _positionServiceMock = new Mock<IPositionService>();
        _sut = new CreatePositionCommandHandler(_positionServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsPositionDto_WhenCreationSucceeds()
    {
        var createDto = new CreatePositionDtoBuilder().WithTitle("Manager").WithCode("MGR").Build();
        var expected = new PositionDtoBuilder().WithId(100).WithTitle("Manager").WithCode("MGR").Build();
        _positionServiceMock.Setup(s => s.CreateAsync(createDto, It.IsAny<CancellationToken>())).ReturnsAsync(expected);
        var command = new CreatePositionCommand { CreatePositionDto = createDto };
        var result = await _sut.Handle(command, CancellationToken.None);
        result.Should().NotBeNull().And.BeSameAs(expected);
        result.Id.Should().Be(100);
    }

    [Fact]
    public async Task Handle_CallsPositionServiceWithCommandDto_WhenInvoked()
    {
        var createDto = new CreatePositionDtoBuilder().WithTitle("Analyst").Build();
        var position = new PositionDtoBuilder().WithId(1).Build();
        _positionServiceMock.Setup(s => s.CreateAsync(It.IsAny<CreatePositionDto>(), It.IsAny<CancellationToken>())).ReturnsAsync(position);
        var command = new CreatePositionCommand { CreatePositionDto = createDto };
        await _sut.Handle(command, CancellationToken.None);
        _positionServiceMock.Verify(s => s.CreateAsync(It.Is<CreatePositionDto>(dto => ReferenceEquals(dto, createDto)), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ForwardsCancellationToken_WhenInvoked()
    {
        var cts = new CancellationTokenSource();
        var token = cts.Token;
        var createDto = new CreatePositionDtoBuilder().Build();
        var position = new PositionDtoBuilder().Build();
        _positionServiceMock.Setup(s => s.CreateAsync(It.IsAny<CreatePositionDto>(), token)).ReturnsAsync(position);
        var command = new CreatePositionCommand { CreatePositionDto = createDto };
        await _sut.Handle(command, token);
        _positionServiceMock.Verify(s => s.CreateAsync(It.IsAny<CreatePositionDto>(), token), Times.Once);
    }

    [Fact]
    public async Task Handle_PropagatesException_WhenServiceThrows()
    {
        var createDto = new CreatePositionDtoBuilder().Build();
        var command = new CreatePositionCommand { CreatePositionDto = createDto };
        _positionServiceMock.Setup(s => s.CreateAsync(createDto, It.IsAny<CancellationToken>())).ThrowsAsync(new InvalidOperationException("Create failed."));
        Func<Task> act = () => _sut.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("Create failed.");
    }
}
