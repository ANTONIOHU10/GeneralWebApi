using GeneralWebApi.DTOs.ContractTemplate;
using MediatR;

namespace GeneralWebApi.Application.Features.ContractTemplates.Queries;

public class GetContractTemplateByIdQuery : IRequest<ContractTemplateDto>
{
    public int Id { get; set; }
}
