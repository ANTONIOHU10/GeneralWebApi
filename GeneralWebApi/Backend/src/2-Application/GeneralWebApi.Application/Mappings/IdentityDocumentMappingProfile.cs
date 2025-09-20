using AutoMapper;
using GeneralWebApi.Domain.Entities.Documents;
using GeneralWebApi.DTOs.IdentityDocument;

namespace GeneralWebApi.Application.Mappings;

public class IdentityDocumentMappingProfile : Profile
{
    public IdentityDocumentMappingProfile()
    {
        CreateMap<IdentityDocument, IdentityDocumentDto>()
            .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => src.Employee != null ? $"{src.Employee.FirstName} {src.Employee.LastName}" : null));

        CreateMap<IdentityDocument, IdentityDocumentListDto>()
            .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => src.Employee != null ? $"{src.Employee.FirstName} {src.Employee.LastName}" : null));

        CreateMap<CreateIdentityDocumentDto, IdentityDocument>();

        CreateMap<UpdateIdentityDocumentDto, IdentityDocument>();
    }
}
