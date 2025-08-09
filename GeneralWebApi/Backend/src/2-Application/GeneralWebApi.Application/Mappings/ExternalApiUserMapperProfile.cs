using AutoMapper;
using GeneralWebApi.DTOs.Users;
using GeneralWebApi.HttpClient.Models.ExternalUsers;

namespace GeneralWebApi.Application.Mappings;

public class ExternalApiUserMapperProfile : Profile
{
    public ExternalApiUserMapperProfile()
    {
        // Example: map fields with different names

        // d = destination, s = source
        // m = mapping
        CreateMap<ExternalUserResponse, UserDto>()
            .ForMember(d => d.Id, m => m.MapFrom(s => s.UserId))
            .ForMember(d => d.Name, m => m.MapFrom(s => $"{s.FirstName} {s.LastName}"))
            .ForMember(d => d.Email, m => m.MapFrom(s => s.Email));
    }
}
