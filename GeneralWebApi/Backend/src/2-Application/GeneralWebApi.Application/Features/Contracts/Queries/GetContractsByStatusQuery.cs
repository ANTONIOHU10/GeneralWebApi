using GeneralWebApi.DTOs.Contract;
using MediatR;

namespace GeneralWebApi.Application.Features.Contracts.Queries;

public class GetContractsByStatusQuery : IRequest<List<ContractDto>>
{
    public string Status { get; set; } = string.Empty;
}





