using FluentAssertions;
using GeneralWebApi.Application.Features.Positions.Handlers;
using GeneralWebApi.Application.Features.Positions.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Position;
using GeneralWebApi.UnitTests.Builders;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Positions;

public sealed class GetPositionsQueryHandlerTests
{
    private readonly Mock<IPositionService> _positionServiceMock;
    private readonly GetPositionsQueryHandler _sut;

    public GetPositionsQueryHandlerTests()
    {
        _positionServiceMock = new Mock<IPositionService>();
        _sut = new GetPositionsQueryHandler(_positionServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsPagedResult_WhenServiceReturnsData()
    {
        var searchDto = new PositionSearchDtoBuilder().WithPage(1, 20).WithSearchTerm("engineer").Build();
        var items = new List<PositionListDto> { new() { Id = 1, Title = "Software Engineer", Code = "SE", Description = "", DepartmentId = 10, Level = 1, EmployeeCount = 5 } };
        var expectedPaged = new PagedResult<PositionListDto>(items, 1, 1, 20);
        _positionServiceMock.Setup(s => s.GetPagedAsync(searchDto, It.IsAny<CancellationToken>())).ReturnsAsync(expectedPaged);
        var query = new GetPositionsQuery { PositionSearchDto = searchDto };
        var result = await _sut.Handle(query, CancellationToken.None);
        result.Should().NotBeNull().And.BeSameAs(expectedPaged);
        result.Items.Should().HaveCount(1);
    }

    [Fact]
    public async Task Handle_CallsPositionServiceWithQuerySearchDto_WhenInvoked()
    {
        var searchDto = new PositionSearchDtoBuilder().WithPage(2, 10).Build();
        var paged = new PagedResult<PositionListDto>(new List<PositionListDto>(), 0, 2, 10);
        _positionServiceMock.Setup(s => s.GetPagedAsync(It.IsAny<PositionSearchDto>(), It.IsAny<CancellationToken>())).ReturnsAsync(paged);
        var query = new GetPositionsQuery { PositionSearchDto = searchDto };
        await _sut.Handle(query, CancellationToken.None);
        _positionServiceMock.Verify(s => s.GetPagedAsync(It.Is<PositionSearchDto>(dto => ReferenceEquals(dto, searchDto)), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ForwardsCancellationToken_WhenInvoked()
    {
        var cts = new CancellationTokenSource();
        var token = cts.Token;
        var searchDto = new PositionSearchDtoBuilder().Build();
        var paged = new PagedResult<PositionListDto>(new List<PositionListDto>(), 0, 1, 10);
        _positionServiceMock.Setup(s => s.GetPagedAsync(It.IsAny<PositionSearchDto>(), token)).ReturnsAsync(paged);
        var query = new GetPositionsQuery { PositionSearchDto = searchDto };
        await _sut.Handle(query, token);
        _positionServiceMock.Verify(s => s.GetPagedAsync(It.IsAny<PositionSearchDto>(), token), Times.Once);
    }

    [Fact]
    public async Task Handle_PropagatesException_WhenServiceThrows()
    {
        var searchDto = new PositionSearchDtoBuilder().Build();
        var query = new GetPositionsQuery { PositionSearchDto = searchDto };
        _positionServiceMock.Setup(s => s.GetPagedAsync(searchDto, It.IsAny<CancellationToken>())).ThrowsAsync(new InvalidOperationException("Paged query failed."));
        Func<Task> act = () => _sut.Handle(query, CancellationToken.None);
        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("Paged query failed.");
    }
}
