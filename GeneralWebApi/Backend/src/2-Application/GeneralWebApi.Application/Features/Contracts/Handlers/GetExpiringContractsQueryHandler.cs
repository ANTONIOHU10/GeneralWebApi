using GeneralWebApi.Application.Features.Contracts.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Contract;
using MediatR;

namespace GeneralWebApi.Application.Features.Contracts.Handlers;

public class GetExpiringContractsQueryHandler : IRequestHandler<GetExpiringContractsQuery, List<ContractDto>>
{
    private readonly IContractService _contractService;

    public GetExpiringContractsQueryHandler(IContractService contractService)
    {
        _contractService = contractService;
    }

    public async Task<List<ContractDto>> Handle(GetExpiringContractsQuery request, CancellationToken cancellationToken)
    {
        return await _contractService.GetExpiringContractsAsync(request.DaysFromNow, cancellationToken);
    }
}





