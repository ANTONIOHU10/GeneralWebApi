using AutoMapper;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Contracts.Responses;

namespace GeneralWebApi.Contracts.Mapping;

/// <summary>
/// AutoMapper profile for ExternalApiConfig entity mappings
/// Maps between Domain Entity and Response DTOs
/// </summary>
public class ExternalApiConfigMapperProfile : Profile
{
    public ExternalApiConfigMapperProfile()
    {
        // Map from Domain Entity to Response DTO
        CreateMap<ExternalApiConfig, ExternalApiConfigResponse>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.BaseUrl, opt => opt.MapFrom(src => src.BaseUrl))
            .ForMember(dest => dest.Endpoint, opt => opt.MapFrom(src => src.Endpoint))
            .ForMember(dest => dest.HttpMethod, opt => opt.MapFrom(src => src.HttpMethod))
            .ForMember(dest => dest.TimeoutSeconds, opt => opt.MapFrom(src => src.TimeoutSeconds))
            .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
            .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category))
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
            .ForMember(dest => dest.CreatedBy, opt => opt.MapFrom(src => src.CreatedBy))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt))
            .ForMember(dest => dest.UpdatedBy, opt => opt.MapFrom(src => src.UpdatedBy))
            .ForMember(dest => dest.Version, opt => opt.MapFrom(src => src.Version))
            .ForMember(dest => dest.SortOrder, opt => opt.MapFrom(src => src.SortOrder))
            .ForMember(dest => dest.Remarks, opt => opt.MapFrom(src => src.Remarks));

        // Map from Request DTO to Domain Entity (for create/update operations)
        CreateMap<Requests.ExternalApiConfigRequest, ExternalApiConfig>()
            .ForMember(dest => dest.Id, opt => opt.Ignore()) // Ignore Id for create operations
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore()) // Ignore audit fields
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
            .ForMember(dest => dest.DeletedAt, opt => opt.Ignore())
            .ForMember(dest => dest.DeletedBy, opt => opt.Ignore())
            .ForMember(dest => dest.Version, opt => opt.Ignore())
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true)) // Default to active
            .ForMember(dest => dest.SortOrder, opt => opt.MapFrom(src => 0)); // Default sort order
    }
}