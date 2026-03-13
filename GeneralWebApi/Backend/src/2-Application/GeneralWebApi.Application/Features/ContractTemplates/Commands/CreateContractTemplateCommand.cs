using GeneralWebApi.DTOs.ContractTemplate;
using MediatR;

namespace GeneralWebApi.Application.Features.ContractTemplates.Commands;

public class CreateContractTemplateCommand : IRequest<ContractTemplateDto>
{
    public CreateContractTemplateDto CreateDto { get; set; } = null!;
}
