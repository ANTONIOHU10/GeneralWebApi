using GeneralWebApi.Application.Features.Contracts.Commands;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Contract;
using MediatR;

namespace GeneralWebApi.Application.Features.Contracts.Handlers;

public class UpdateContractCommandHandler : IRequestHandler<UpdateContractCommand, ContractDto>
{
    private readonly IContractService _contractService;

    public UpdateContractCommandHandler(IContractService contractService)
    {
        _contractService = contractService;
    }

    public async Task<ContractDto> Handle(UpdateContractCommand request, CancellationToken cancellationToken)
    {
        return await _contractService.UpdateAsync(request.UpdateContractDto.Id, request.UpdateContractDto, cancellationToken);
    }
}





