using GeneralWebApi.Application.Features.Contracts.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Contract;
using MediatR;

namespace GeneralWebApi.Application.Features.Contracts.Handlers;

public class GetExpiredContractsQueryHandler : IRequestHandler<GetExpiredContractsQuery, List<ContractDto>>
{
    private readonly IContractService _contractService;

    public GetExpiredContractsQueryHandler(IContractService contractService)
    {
        _contractService = contractService;
    }

    public async Task<List<ContractDto>> Handle(GetExpiredContractsQuery request, CancellationToken cancellationToken)
    {
        return await _contractService.GetExpiredContractsAsync(cancellationToken);
    }
}

