using AutoMapper;
using GeneralWebApi.DTOs.Permissions;
using GeneralWebApi.Domain.Entities.Permissions;

namespace GeneralWebApi.Application.Mappings;

/// <summary>
/// Permission mapping profile for AutoMapper
/// </summary>
public class PermissionMappingProfile : Profile
{
    public PermissionMappingProfile()
    {
        // Role mappings
        CreateMap<Role, RoleDto>()
            .ForMember(dest => dest.Permissions, opt => opt.MapFrom(src => src.RolePermissions.Select(rp => rp.Permission)))
            .ForMember(dest => dest.EmployeeCount, opt => opt.Ignore());

        CreateMap<Role, RoleListDto>()
            .ForMember(dest => dest.EmployeeCount, opt => opt.Ignore())
            .ForMember(dest => dest.PermissionCount, opt => opt.MapFrom(src => src.RolePermissions.Count));

        CreateMap<CreateRoleDto, Role>();
        CreateMap<UpdateRoleDto, Role>();

        // Permission mappings
        CreateMap<Permission, PermissionDto>();
        CreateMap<Permission, PermissionListDto>();
        CreateMap<CreatePermissionDto, Permission>();
        CreateMap<UpdatePermissionDto, Permission>();

        // EmployeeRole mappings
        CreateMap<EmployeeRole, EmployeeRoleDto>()
            .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => $"{src.Employee.FirstName} {src.Employee.LastName}"))
            .ForMember(dest => dest.EmployeeNumber, opt => opt.MapFrom(src => src.Employee.EmployeeNumber))
            .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role.Name))
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.ExpiryDate == null || src.ExpiryDate > DateTime.UtcNow));

        CreateMap<AssignRoleToEmployeeDto, EmployeeRole>()
            .ForMember(dest => dest.AssignedDate, opt => opt.MapFrom(src => DateTime.UtcNow));

        // RolePermission mappings
        CreateMap<RolePermission, PermissionDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Permission.Id))
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Permission.Name))
            .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Permission.Description))
            .ForMember(dest => dest.Resource, opt => opt.MapFrom(src => src.Permission.Resource))
            .ForMember(dest => dest.Action, opt => opt.MapFrom(src => src.Permission.Action))
            .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Permission.Category))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.Permission.CreatedAt))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.Permission.UpdatedAt));
    }
}
