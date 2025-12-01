using System.Security.Claims;
using GeneralWebApi.Application.Features.Contracts.Commands;
using GeneralWebApi.Application.Services;
using GeneralWebApi.Application.Services.Contracts.Approvals;
using GeneralWebApi.DTOs.Contract;
using GeneralWebApi.DTOs.Contracts.Approvals;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace GeneralWebApi.Application.Features.Contracts.Handlers;

public class CreateContractCommandHandler : IRequestHandler<CreateContractCommand, ContractDto>
{
    private readonly IContractService _contractService;
    private readonly IContractApprovalService _approvalService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CreateContractCommandHandler(
        IContractService contractService,
        IContractApprovalService approvalService,
        IHttpContextAccessor httpContextAccessor)
    {
        _contractService = contractService;
        _approvalService = approvalService;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<ContractDto> Handle(CreateContractCommand request, CancellationToken cancellationToken)
    {
        // Create the contract
        var contract = await _contractService.CreateAsync(request.CreateContractDto, cancellationToken);

        // If SubmitForApproval is true, automatically submit for approval
        if (request.CreateContractDto.SubmitForApproval)
        {
            var userId = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
            if (!string.IsNullOrEmpty(userId))
            {
                try
                {
                    // Convert ApprovalStepDto to ApprovalStepRequest
                    List<ApprovalStepRequest>? approvalSteps = null;
                    if (request.CreateContractDto.ApprovalSteps != null && request.CreateContractDto.ApprovalSteps.Any())
                    {
                        approvalSteps = request.CreateContractDto.ApprovalSteps.Select(s => new ApprovalStepRequest
                        {
                            StepOrder = s.StepOrder,
                            StepName = s.StepName,
                            ApproverUserId = s.ApproverUserId,
                            ApproverUserName = s.ApproverUserName,
                            ApproverRole = s.ApproverRole
                        }).ToList();
                    }

                    await _approvalService.SubmitForApprovalAsync(
                        contract.Id,
                        userId,
                        request.CreateContractDto.ApprovalComments,
                        approvalSteps,
                        cancellationToken);
                }
                catch (Exception)
                {
                    // Log error but don't fail contract creation if approval submission fails
                    // The contract is already created, approval can be submitted manually later
                }
            }
        }

        return contract;
    }
}





