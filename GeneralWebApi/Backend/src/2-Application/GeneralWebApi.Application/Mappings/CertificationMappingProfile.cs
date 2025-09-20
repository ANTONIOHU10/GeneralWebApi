using AutoMapper;
using GeneralWebApi.Domain.Entities.Documents;
using GeneralWebApi.DTOs.Certification;

namespace GeneralWebApi.Application.Mappings;

public class CertificationMappingProfile : Profile
{
    public CertificationMappingProfile()
    {
        CreateMap<Certification, CertificationDto>()
            .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => src.Employee != null ? $"{src.Employee.FirstName} {src.Employee.LastName}" : null));

        CreateMap<CreateCertificationDto, Certification>();

        CreateMap<UpdateCertificationDto, Certification>();

        CreateMap<Certification, CertificationListDto>()
            .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => src.Employee != null ? $"{src.Employee.FirstName} {src.Employee.LastName}" : null));
    }
}

