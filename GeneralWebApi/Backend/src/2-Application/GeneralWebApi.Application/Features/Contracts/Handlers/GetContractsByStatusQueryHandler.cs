using GeneralWebApi.Application.Features.Contracts.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Contract;
using MediatR;

namespace GeneralWebApi.Application.Features.Contracts.Handlers;

public class GetContractsByStatusQueryHandler : IRequestHandler<GetContractsByStatusQuery, List<ContractDto>>
{
    private readonly IContractService _contractService;

    public GetContractsByStatusQueryHandler(IContractService contractService)
    {
        _contractService = contractService;
    }

    public async Task<List<ContractDto>> Handle(GetContractsByStatusQuery request, CancellationToken cancellationToken)
    {
        return await _contractService.GetContractsByStatusAsync(request.Status, cancellationToken);
    }
}



