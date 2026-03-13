using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.ContractTemplate;
using MediatR;

namespace GeneralWebApi.Application.Features.ContractTemplates.Queries;

public class GetContractTemplatesQuery : IRequest<PagedResult<ContractTemplateListDto>>
{
    public ContractTemplateSearchDto SearchDto { get; set; } = null!;
}
