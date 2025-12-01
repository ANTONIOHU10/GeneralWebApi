using GeneralWebApi.DTOs.Contract;
using MediatR;

namespace GeneralWebApi.Application.Features.Contracts.Queries;

public class GetExpiredContractsQuery : IRequest<List<ContractDto>>
{
}

