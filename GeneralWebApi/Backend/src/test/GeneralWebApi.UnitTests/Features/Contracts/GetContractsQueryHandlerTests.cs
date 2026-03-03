using FluentAssertions;
using GeneralWebApi.Application.Features.Contracts.Handlers;
using GeneralWebApi.Application.Features.Contracts.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Contract;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Contracts;

public sealed class GetContractsQueryHandlerTests
{
    private readonly Mock<IContractService> _contractServiceMock;
    private readonly GetContractsQueryHandler _sut;

    public GetContractsQueryHandlerTests()
    {
        _contractServiceMock = new Mock<IContractService>();
        _sut = new GetContractsQueryHandler(_contractServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsPagedResult_FromService()
    {
        // Arrange
        var searchDto = new ContractSearchDto
        {
            EmployeeId = 1,
            PageNumber = 1,
            PageSize = 20
        };

        var pagedResult = new PagedResult<ContractListDto>
        {
            PageNumber = 1,
            PageSize = 20,
            TotalCount = 1,
            Items = new List<ContractListDto>
            {
                new()
                {
                    Id = 100,
                    EmployeeId = 1,
                    ContractType = "Permanent"
                }
            }
        };

        _contractServiceMock
            .Setup(s => s.GetPagedAsync(searchDto, It.IsAny<CancellationToken>()))
            .ReturnsAsync(pagedResult);

        var query = new GetContractsQuery { ContractSearchDto = searchDto };

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeSameAs(pagedResult);
        result.Items.Should().HaveCount(1);
        result.Items[0].Id.Should().Be(100);
    }
}

