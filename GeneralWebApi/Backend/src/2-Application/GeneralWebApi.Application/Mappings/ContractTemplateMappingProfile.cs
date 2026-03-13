using AutoMapper;
using GeneralWebApi.Domain.Entities.Documents;
using GeneralWebApi.DTOs.ContractTemplate;

namespace GeneralWebApi.Application.Mappings;

/// <summary>
/// AutoMapper profile for ContractTemplate entity and DTOs.
/// </summary>
public class ContractTemplateMappingProfile : Profile
{
    public ContractTemplateMappingProfile()
    {
        CreateMap<ContractTemplate, ContractTemplateDto>();
        CreateMap<ContractTemplate, ContractTemplateListDto>();
        CreateMap<CreateContractTemplateDto, ContractTemplate>();
    }
}
