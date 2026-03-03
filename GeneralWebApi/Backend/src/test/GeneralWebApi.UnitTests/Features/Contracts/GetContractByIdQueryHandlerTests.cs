using FluentAssertions;
using GeneralWebApi.Application.Features.Contracts.Handlers;
using GeneralWebApi.Application.Features.Contracts.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Contract;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Contracts;

public sealed class GetContractByIdQueryHandlerTests
{
    private readonly Mock<IContractService> _contractServiceMock;
    private readonly GetContractByIdQueryHandler _sut;

    public GetContractByIdQueryHandlerTests()
    {
        _contractServiceMock = new Mock<IContractService>();
        _sut = new GetContractByIdQueryHandler(_contractServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsContract_FromService()
    {
        // Arrange
        const int id = 10;

        var contract = new ContractDto { Id = id, EmployeeId = 1, ContractType = "Permanent" };

        _contractServiceMock
            .Setup(s => s.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(contract);

        var query = new GetContractByIdQuery { Id = id };

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeSameAs(contract);
    }
}

