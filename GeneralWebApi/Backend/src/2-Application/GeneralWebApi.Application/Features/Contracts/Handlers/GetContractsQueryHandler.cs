using GeneralWebApi.Application.Features.Contracts.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Contract;
using MediatR;

namespace GeneralWebApi.Application.Features.Contracts.Handlers;

public class GetContractsQueryHandler : IRequestHandler<GetContractsQuery, PagedResult<ContractListDto>>
{
    private readonly IContractService _contractService;

    public GetContractsQueryHandler(IContractService contractService)
    {
        _contractService = contractService;
    }

    public async Task<PagedResult<ContractListDto>> Handle(GetContractsQuery request, CancellationToken cancellationToken)
    {
        return await _contractService.GetPagedAsync(request.ContractSearchDto, cancellationToken);
    }
}



