using AutoMapper;
using GeneralWebApi.Domain.Entities.Anagraphy;
using GeneralWebApi.DTOs.Position;

namespace GeneralWebApi.Application.Mappings;

public class PositionMappingProfile : Profile
{
    public PositionMappingProfile()
    {
        CreateMap<Position, PositionDto>()
            .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department != null ? src.Department.Name : null))
            .ForMember(dest => dest.ParentPositionTitle, opt => opt.MapFrom(src => src.ParentPosition != null ? src.ParentPosition.Title : null));

        CreateMap<CreatePositionDto, Position>();

        CreateMap<UpdatePositionDto, Position>();

        CreateMap<Position, PositionListDto>()
            .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department != null ? src.Department.Name : null))
            .ForMember(dest => dest.ParentPositionTitle, opt => opt.MapFrom(src => src.ParentPosition != null ? src.ParentPosition.Title : null))
            .ForMember(dest => dest.EmployeeCount, opt => opt.MapFrom(src => src.Employees.Count));
    }
}



