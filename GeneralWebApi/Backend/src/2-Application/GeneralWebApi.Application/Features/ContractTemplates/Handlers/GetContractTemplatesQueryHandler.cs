using GeneralWebApi.Application.Features.ContractTemplates.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.ContractTemplate;
using MediatR;

namespace GeneralWebApi.Application.Features.ContractTemplates.Handlers;

public class GetContractTemplatesQueryHandler : IRequestHandler<GetContractTemplatesQuery, PagedResult<ContractTemplateListDto>>
{
    private readonly IContractTemplateService _service;

    public GetContractTemplatesQueryHandler(IContractTemplateService service)
    {
        _service = service;
    }

    public async Task<PagedResult<ContractTemplateListDto>> Handle(GetContractTemplatesQuery request, CancellationToken cancellationToken)
    {
        return await _service.GetPagedAsync(request.SearchDto, cancellationToken);
    }
}
