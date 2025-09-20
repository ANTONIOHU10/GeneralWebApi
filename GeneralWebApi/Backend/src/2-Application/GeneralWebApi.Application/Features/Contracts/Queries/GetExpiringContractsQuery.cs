using GeneralWebApi.DTOs.Contract;
using MediatR;

namespace GeneralWebApi.Application.Features.Contracts.Queries;

public class GetExpiringContractsQuery : IRequest<List<ContractDto>>
{
    public DateTime ExpiryDate { get; set; }
}





