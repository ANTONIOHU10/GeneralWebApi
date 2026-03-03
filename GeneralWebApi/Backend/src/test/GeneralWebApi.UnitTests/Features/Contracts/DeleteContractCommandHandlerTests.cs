using FluentAssertions;
using GeneralWebApi.Application.Features.Contracts.Commands;
using GeneralWebApi.Application.Features.Contracts.Handlers;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Contract;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Contracts;

public sealed class DeleteContractCommandHandlerTests
{
    private readonly Mock<IContractService> _contractServiceMock;
    private readonly DeleteContractCommandHandler _sut;

    public DeleteContractCommandHandlerTests()
    {
        _contractServiceMock = new Mock<IContractService>();
        _sut = new DeleteContractCommandHandler(_contractServiceMock.Object);
    }

    [Fact]
    public async Task Handle_DeletesContract_AndReturnsDto()
    {
        // Arrange
        const int id = 10;

        var deleted = new ContractDto { Id = id, Status = "Deleted" };

        _contractServiceMock
            .Setup(s => s.DeleteAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(deleted);

        var command = new DeleteContractCommand { Id = id };

        // Act
        var result = await _sut.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeSameAs(deleted);
        _contractServiceMock.Verify(s => s.DeleteAsync(id, It.IsAny<CancellationToken>()), Times.Once);
    }
}

