using FluentAssertions;
using GeneralWebApi.Application.Features.Contracts.Commands;
using GeneralWebApi.Application.Features.Contracts.Handlers;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Contract;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Contracts;

public sealed class UpdateContractCommandHandlerTests
{
    private readonly Mock<IContractService> _contractServiceMock;
    private readonly UpdateContractCommandHandler _sut;

    public UpdateContractCommandHandlerTests()
    {
        _contractServiceMock = new Mock<IContractService>();
        _sut = new UpdateContractCommandHandler(_contractServiceMock.Object);
    }

    [Fact]
    public async Task Handle_UpdatesContract_UsingDtoId()
    {
        // Arrange
        var updateDto = new UpdateContractDto
        {
            Id = 10,
            EmployeeId = 1,
            ContractType = "Permanent"
        };

        var updated = new ContractDto { Id = 10, EmployeeId = 1, ContractType = "Permanent" };

        _contractServiceMock
            .Setup(s => s.UpdateAsync(updateDto.Id, updateDto, It.IsAny<CancellationToken>()))
            .ReturnsAsync(updated);

        var command = new UpdateContractCommand { UpdateContractDto = updateDto };

        // Act
        var result = await _sut.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeSameAs(updated);
        _contractServiceMock.Verify(s => s.UpdateAsync(updateDto.Id, updateDto, It.IsAny<CancellationToken>()), Times.Once);
    }
}

