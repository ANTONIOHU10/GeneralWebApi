using AutoMapper;
using GeneralWebApi.Domain.Entities.Documents;
using GeneralWebApi.DTOs.Education;

namespace GeneralWebApi.Application.Mappings;

public class EducationMappingProfile : Profile
{
    public EducationMappingProfile()
    {
        CreateMap<Education, EducationDto>()
            .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => src.Employee != null ? $"{src.Employee.FirstName} {src.Employee.LastName}" : null));

        CreateMap<Education, EducationListDto>()
            .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => src.Employee != null ? $"{src.Employee.FirstName} {src.Employee.LastName}" : null));

        CreateMap<CreateEducationDto, Education>();

        CreateMap<UpdateEducationDto, Education>();
    }
}





