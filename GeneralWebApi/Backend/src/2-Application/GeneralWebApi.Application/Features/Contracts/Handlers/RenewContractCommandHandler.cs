using GeneralWebApi.Application.Features.Contracts.Commands;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Contract;
using MediatR;

namespace GeneralWebApi.Application.Features.Contracts.Handlers;

public class RenewContractCommandHandler : IRequestHandler<RenewContractCommand, ContractDto>
{
    private readonly IContractService _contractService;

    public RenewContractCommandHandler(IContractService contractService)
    {
        _contractService = contractService;
    }

    public async Task<ContractDto> Handle(RenewContractCommand request, CancellationToken cancellationToken)
    {
        return await _contractService.RenewAsync(request.Id, cancellationToken);
    }
}

