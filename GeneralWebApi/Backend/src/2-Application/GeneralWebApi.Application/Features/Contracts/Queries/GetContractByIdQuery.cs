using GeneralWebApi.DTOs.Contract;
using MediatR;

namespace GeneralWebApi.Application.Features.Contracts.Queries;

public class GetContractByIdQuery : IRequest<ContractDto>
{
    public int Id { get; set; }
}



