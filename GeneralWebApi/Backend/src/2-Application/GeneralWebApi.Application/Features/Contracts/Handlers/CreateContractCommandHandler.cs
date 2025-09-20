using GeneralWebApi.Application.Features.Contracts.Commands;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Contract;
using MediatR;

namespace GeneralWebApi.Application.Features.Contracts.Handlers;

public class CreateContractCommandHandler : IRequestHandler<CreateContractCommand, ContractDto>
{
    private readonly IContractService _contractService;

    public CreateContractCommandHandler(IContractService contractService)
    {
        _contractService = contractService;
    }

    public async Task<ContractDto> Handle(CreateContractCommand request, CancellationToken cancellationToken)
    {
        return await _contractService.CreateAsync(request.CreateContractDto, cancellationToken);
    }
}



