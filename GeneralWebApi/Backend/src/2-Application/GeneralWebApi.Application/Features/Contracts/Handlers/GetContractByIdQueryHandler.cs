using GeneralWebApi.Application.Features.Contracts.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Contract;
using MediatR;

namespace GeneralWebApi.Application.Features.Contracts.Handlers;

public class GetContractByIdQueryHandler : IRequestHandler<GetContractByIdQuery, ContractDto>
{
    private readonly IContractService _contractService;

    public GetContractByIdQueryHandler(IContractService contractService)
    {
        _contractService = contractService;
    }

    public async Task<ContractDto> Handle(GetContractByIdQuery request, CancellationToken cancellationToken)
    {
        return await _contractService.GetByIdAsync(request.Id, cancellationToken);
    }
}





