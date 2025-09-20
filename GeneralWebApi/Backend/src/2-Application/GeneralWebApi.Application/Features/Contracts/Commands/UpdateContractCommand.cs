using GeneralWebApi.DTOs.Contract;
using MediatR;

namespace GeneralWebApi.Application.Features.Contracts.Commands;

public class UpdateContractCommand : IRequest<ContractDto>
{
    public UpdateContractDto UpdateContractDto { get; set; } = null!;
}

