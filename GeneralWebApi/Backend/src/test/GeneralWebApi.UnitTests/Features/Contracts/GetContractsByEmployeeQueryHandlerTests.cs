using FluentAssertions;
using GeneralWebApi.Application.Features.Contracts.Handlers;
using GeneralWebApi.Application.Features.Contracts.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Contract;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Contracts;

public sealed class GetContractsByEmployeeQueryHandlerTests
{
    private readonly Mock<IContractService> _contractServiceMock;
    private readonly GetContractsByEmployeeQueryHandler _sut;

    public GetContractsByEmployeeQueryHandlerTests()
    {
        _contractServiceMock = new Mock<IContractService>();
        _sut = new GetContractsByEmployeeQueryHandler(_contractServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsContracts_ForEmployee()
    {
        // Arrange
        const int employeeId = 5;

        var contracts = new List<ContractDto>
        {
            new() { Id = 1, EmployeeId = employeeId, ContractType = "Permanent" }
        };

        _contractServiceMock
            .Setup(s => s.GetByEmployeeIdAsync(employeeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(contracts);

        var query = new GetContractsByEmployeeQuery { EmployeeId = employeeId };

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeSameAs(contracts);
        result.Should().HaveCount(1);
        result[0].EmployeeId.Should().Be(employeeId);
    }
}

