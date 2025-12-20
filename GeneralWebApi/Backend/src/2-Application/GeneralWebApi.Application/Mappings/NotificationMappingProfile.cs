using AutoMapper;
using GeneralWebApi.Domain.Entities.Notifications;
using GeneralWebApi.DTOs.Notification;

namespace GeneralWebApi.Application.Mappings;

/// <summary>
/// AutoMapper profile for Notification entity mappings
/// </summary>
public class NotificationMappingProfile : Profile
{
    public NotificationMappingProfile()
    {
        CreateMap<Notification, NotificationDto>()
            .ForMember(dest => dest.Status, opt => opt.Ignore()) // Status is computed from ReadStatuses
            .ForMember(dest => dest.ReadAt, opt => opt.Ignore()) // ReadAt is computed from ReadStatuses
            .ForMember(dest => dest.ArchivedAt, opt => opt.Ignore()) // ArchivedAt is computed from ReadStatuses
            .ForMember(dest => dest.Metadata, opt => opt.Ignore()); // Metadata is deserialized separately

        CreateMap<CreateNotificationDto, Notification>()
            .ForMember(dest => dest.Metadata, opt => opt.Ignore()); // Metadata is serialized separately

        CreateMap<Notification, NotificationListDto>()
            .ForMember(dest => dest.Status, opt => opt.Ignore()) // Status is computed from ReadStatuses
            .ForMember(dest => dest.ReadAt, opt => opt.Ignore()) // ReadAt is computed from ReadStatuses
            .ForMember(dest => dest.IsExpired, opt => opt.Ignore()); // IsExpired is computed
    }
}

