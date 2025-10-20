using GeneralWebApi.DTOs.Contract;
using MediatR;

namespace GeneralWebApi.Application.Features.Contracts.Commands;

public class DeleteContractCommand : IRequest<ContractDto>
{
    public int Id { get; set; }
}





