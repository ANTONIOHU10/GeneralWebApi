using FluentAssertions;
using GeneralWebApi.Application.Services;
using GeneralWebApi.Application.Services.Contracts.Approvals;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Documents;
using GeneralWebApi.Domain.Entities.Documents.Approvals;
using GeneralWebApi.DTOs.Contracts.Approvals;
using GeneralWebApi.Integration.Repository.DocumentsRepository;
using GeneralWebApi.Integration.Repository.DocumentsRepository.Approvals;
using Microsoft.Extensions.Logging;
using Moq;

namespace GeneralWebApi.UnitTests.Services.Contracts;

public sealed class ContractApprovalServiceTests
{
    private readonly Mock<IContractRepository> _contractRepositoryMock;
    private readonly Mock<IContractApprovalRepository> _approvalRepositoryMock;
    private readonly Mock<INotificationService> _notificationServiceMock;
    private readonly Mock<ILogger<ContractApprovalService>> _loggerMock;
    private readonly ContractApprovalService _sut;

    public ContractApprovalServiceTests()
    {
        _contractRepositoryMock = new Mock<IContractRepository>();
        _approvalRepositoryMock = new Mock<IContractApprovalRepository>();
        _notificationServiceMock = new Mock<INotificationService>();
        _loggerMock = new Mock<ILogger<ContractApprovalService>>();

        _sut = new ContractApprovalService(
            _contractRepositoryMock.Object,
            _approvalRepositoryMock.Object,
            _notificationServiceMock.Object,
            _loggerMock.Object);
    }

    [Fact]
    public async Task SubmitForApprovalAsync_CreatesApproval_AndUpdatesContractStatus()
    {
        // Arrange
        const int contractId = 10;
        const string requestedBy = "user-1";

        var contract = new Contract
        {
            Id = contractId,
            EmployeeId = 5,
            Status = "Draft"
        };

        _contractRepositoryMock
            .Setup(r => r.GetByIdAsync(contractId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(contract);

        _approvalRepositoryMock
            .Setup(r => r.GetPendingByContractIdAsync(contractId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((ContractApproval?)null);

        ContractApproval? savedApproval = null;

        _approvalRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<ContractApproval>(), It.IsAny<CancellationToken>()))
            .Callback<ContractApproval, CancellationToken>((a, _) => savedApproval = a)
            .ReturnsAsync(() => savedApproval!);

        _approvalRepositoryMock
            .Setup(r => r.GetByIdWithStepsAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(() => savedApproval!);

        _contractRepositoryMock
            .Setup(r => r.UpdateAsync(contract, It.IsAny<CancellationToken>()))
            .ReturnsAsync(contract);

        var dto = new List<ApprovalStepRequest>
        {
            new()
            {
                StepOrder = 1,
                StepName = "Manager",
                ApproverUserId = "mgr-1",
                ApproverUserName = "Manager"
            }
        };

        // Act
        var result = await _sut.SubmitForApprovalAsync(contractId, requestedBy, "please approve", dto);

        // Assert
        result.ContractId.Should().Be(contractId);
        result.Status.Should().Be("Pending");
        contract.Status.Should().Be("Pending");

        _contractRepositoryMock.Verify(r => r.UpdateAsync(contract, It.IsAny<CancellationToken>()), Times.Once);
        _approvalRepositoryMock.Verify(r => r.AddAsync(It.IsAny<ContractApproval>(), It.IsAny<CancellationToken>()), Times.Once);
    }
}

