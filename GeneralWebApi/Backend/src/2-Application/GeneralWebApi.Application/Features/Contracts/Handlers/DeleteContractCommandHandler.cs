using GeneralWebApi.Application.Features.Contracts.Commands;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Contract;
using MediatR;

namespace GeneralWebApi.Application.Features.Contracts.Handlers;

public class DeleteContractCommandHandler : IRequestHandler<DeleteContractCommand, ContractDto>
{
    private readonly IContractService _contractService;

    public DeleteContractCommandHandler(IContractService contractService)
    {
        _contractService = contractService;
    }

    public async Task<ContractDto> Handle(DeleteContractCommand request, CancellationToken cancellationToken)
    {
        return await _contractService.DeleteAsync(request.Id, cancellationToken);
    }
}



