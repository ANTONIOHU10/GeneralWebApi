using GeneralWebApi.Application.Features.ContractTemplates.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.ContractTemplate;
using MediatR;

namespace GeneralWebApi.Application.Features.ContractTemplates.Handlers;

public class GetContractTemplateByIdQueryHandler : IRequestHandler<GetContractTemplateByIdQuery, ContractTemplateDto>
{
    private readonly IContractTemplateService _service;

    public GetContractTemplateByIdQueryHandler(IContractTemplateService service)
    {
        _service = service;
    }

    public async Task<ContractTemplateDto> Handle(GetContractTemplateByIdQuery request, CancellationToken cancellationToken)
    {
        return await _service.GetByIdAsync(request.Id, cancellationToken);
    }
}
