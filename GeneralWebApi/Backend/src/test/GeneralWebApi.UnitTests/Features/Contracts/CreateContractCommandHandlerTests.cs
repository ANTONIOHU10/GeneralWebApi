using System.Security.Claims;
using FluentAssertions;
using GeneralWebApi.Application.Features.Contracts.Commands;
using GeneralWebApi.Application.Features.Contracts.Handlers;
using GeneralWebApi.Application.Services;
using GeneralWebApi.Application.Services.Contracts.Approvals;
using GeneralWebApi.DTOs.Contract;
using GeneralWebApi.DTOs.Contracts.Approvals;
using Microsoft.AspNetCore.Http;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Contracts;

public sealed class CreateContractCommandHandlerTests
{
    private readonly Mock<IContractService> _contractServiceMock;
    private readonly Mock<IContractApprovalService> _approvalServiceMock;
    private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
    private readonly CreateContractCommandHandler _sut;

    public CreateContractCommandHandlerTests()
    {
        _contractServiceMock = new Mock<IContractService>();
        _approvalServiceMock = new Mock<IContractApprovalService>();
        _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
        _sut = new CreateContractCommandHandler(
            _contractServiceMock.Object,
            _approvalServiceMock.Object,
            _httpContextAccessorMock.Object);
    }

    [Fact]
    public async Task Handle_CreatesContract_AndReturnsResult()
    {
        // Arrange
        var createDto = new CreateContractDto
        {
            EmployeeId = 1,
            ContractType = "Permanent",
            SubmitForApproval = false
        };

        var created = new ContractDto { Id = 10, EmployeeId = 1, ContractType = "Permanent" };

        _contractServiceMock
            .Setup(s => s.CreateAsync(createDto, It.IsAny<CancellationToken>()))
            .ReturnsAsync(created);

        var command = new CreateContractCommand { CreateContractDto = createDto };

        // Act
        var result = await _sut.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeSameAs(created);
        _approvalServiceMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task Handle_SubmitsForApproval_WhenFlagIsTrue_AndUserInContext()
    {
        // Arrange
        const string userId = "user-1";

        var createDto = new CreateContractDto
        {
            EmployeeId = 1,
            ContractType = "Permanent",
            SubmitForApproval = true,
            ApprovalComments = "auto submit",
            ApprovalSteps = new List<ApprovalStepDto>
            {
                new() { StepOrder = 1, StepName = "Manager", ApproverUserId = "mgr-1", ApproverUserName = "Manager" }
            }
        };

        var created = new ContractDto { Id = 10, EmployeeId = 1, ContractType = "Permanent" };

        _contractServiceMock
            .Setup(s => s.CreateAsync(createDto, It.IsAny<CancellationToken>()))
            .ReturnsAsync(created);

        var identity = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId)
        });
        var principal = new ClaimsPrincipal(identity);
        var httpContext = new DefaultHttpContext { User = principal };

        _httpContextAccessorMock
            .Setup(a => a.HttpContext)
            .Returns(httpContext);

        _approvalServiceMock
            .Setup(s => s.SubmitForApprovalAsync(
                created.Id,
                userId,
                createDto.ApprovalComments,
                It.IsAny<List<ApprovalStepRequest>?>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ContractApprovalDto { ContractId = created.Id });

        var command = new CreateContractCommand { CreateContractDto = createDto };

        // Act
        var result = await _sut.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeSameAs(created);
        _approvalServiceMock.Verify(s => s.SubmitForApprovalAsync(
            created.Id,
            userId,
            createDto.ApprovalComments,
            It.Is<List<ApprovalStepRequest>>(steps => steps.Count == 1 && steps[0].StepOrder == 1),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}

