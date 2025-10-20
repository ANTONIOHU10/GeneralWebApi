using GeneralWebApi.DTOs.Contract;
using MediatR;

namespace GeneralWebApi.Application.Features.Contracts.Queries;

public class GetContractsByEmployeeQuery : IRequest<List<ContractDto>>
{
    public int EmployeeId { get; set; }
}





