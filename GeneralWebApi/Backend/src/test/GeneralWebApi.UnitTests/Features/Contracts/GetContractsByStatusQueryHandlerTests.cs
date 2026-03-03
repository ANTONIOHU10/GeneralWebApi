using FluentAssertions;
using GeneralWebApi.Application.Features.Contracts.Handlers;
using GeneralWebApi.Application.Features.Contracts.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Contract;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Contracts;

public sealed class GetContractsByStatusQueryHandlerTests
{
    private readonly Mock<IContractService> _contractServiceMock;
    private readonly GetContractsByStatusQueryHandler _sut;

    public GetContractsByStatusQueryHandlerTests()
    {
        _contractServiceMock = new Mock<IContractService>();
        _sut = new GetContractsByStatusQueryHandler(_contractServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsContracts_ForStatus()
    {
        // Arrange
        const string status = "Active";

        var contracts = new List<ContractDto>
        {
            new() { Id = 1, Status = status }
        };

        _contractServiceMock
            .Setup(s => s.GetContractsByStatusAsync(status, It.IsAny<CancellationToken>()))
            .ReturnsAsync(contracts);

        var query = new GetContractsByStatusQuery { Status = status };

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeSameAs(contracts);
        result.Should().HaveCount(1);
        result[0].Status.Should().Be(status);
    }
}

