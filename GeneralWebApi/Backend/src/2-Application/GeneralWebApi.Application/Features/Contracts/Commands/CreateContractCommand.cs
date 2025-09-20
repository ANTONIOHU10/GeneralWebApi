using GeneralWebApi.DTOs.Contract;
using MediatR;

namespace GeneralWebApi.Application.Features.Contracts.Commands;

public class CreateContractCommand : IRequest<ContractDto>
{
    public CreateContractDto CreateContractDto { get; set; } = null!;
}

