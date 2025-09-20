using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Contract;
using MediatR;

namespace GeneralWebApi.Application.Features.Contracts.Queries;

public class GetContractsQuery : IRequest<PagedResult<ContractListDto>>
{
    public ContractSearchDto ContractSearchDto { get; set; } = null!;
}



