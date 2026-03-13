using GeneralWebApi.Application.Features.ContractTemplates.Commands;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.ContractTemplate;
using MediatR;

namespace GeneralWebApi.Application.Features.ContractTemplates.Handlers;

public class CreateContractTemplateCommandHandler : IRequestHandler<CreateContractTemplateCommand, ContractTemplateDto>
{
    private readonly IContractTemplateService _service;

    public CreateContractTemplateCommandHandler(IContractTemplateService service)
    {
        _service = service;
    }

    public async Task<ContractTemplateDto> Handle(CreateContractTemplateCommand request, CancellationToken cancellationToken)
    {
        return await _service.CreateAsync(request.CreateDto, cancellationToken);
    }
}
