using System.Linq;
using AutoMapper;
using GeneralWebApi.Domain.Entities.Anagraphy;
using GeneralWebApi.DTOs.Employee;

namespace GeneralWebApi.Application.Mappings;

public class EmployeeMappingProfile : Profile
{
    public EmployeeMappingProfile()
    {
        // Entity to DTO mappings
        CreateMap<Employee, EmployeeDto>()
            .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department != null ? src.Department.Name : null))
            .ForMember(dest => dest.PositionTitle, opt => opt.MapFrom(src => src.Position != null ? src.Position.Title : null))
            .ForMember(dest => dest.ManagerName, opt => opt.MapFrom(src => src.Manager != null ? $"{src.Manager.FirstName} {src.Manager.LastName}" : null))
            // PhoneNumber is now mapped directly from Employee entity
            .AfterMap((src, dest) =>
            {
                // Map contract end date from active contracts
                if (src.Contracts != null && src.Contracts.Any())
                {
                    var activeContract = src.Contracts
                        .Where(c => c.Status == "Active" && c.EndDate.HasValue)
                        .OrderByDescending(c => c.EndDate)
                        .FirstOrDefault();
                    dest.ContractEndDate = activeContract?.EndDate;

                    var latestActiveContract = src.Contracts
                        .Where(c => c.Status == "Active")
                        .OrderByDescending(c => c.StartDate)
                        .FirstOrDefault();
                    dest.ContractType = latestActiveContract?.ContractType;
                }
            });

        // get all employees
        CreateMap<Employee, EmployeeListDto>()
            .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department != null ? src.Department.Name : null))
            .ForMember(dest => dest.PositionTitle, opt => opt.MapFrom(src => src.Position != null ? src.Position.Title : null))
            .ForMember(dest => dest.ManagerName, opt => opt.MapFrom(src => src.Manager != null ? $"{src.Manager.FirstName} {src.Manager.LastName}" : null))
            .AfterMap((src, dest) =>
            {
                // Map contract end date from active contracts
                if (src.Contracts != null && src.Contracts.Any())
                {
                    var activeContract = src.Contracts
                        .Where(c => c.Status == "Active" && c.EndDate.HasValue)
                        .OrderByDescending(c => c.EndDate)
                        .FirstOrDefault();
                    dest.ContractEndDate = activeContract?.EndDate;

                    var latestActiveContract = src.Contracts
                        .Where(c => c.Status == "Active")
                        .OrderByDescending(c => c.StartDate)
                        .FirstOrDefault();
                    dest.ContractType = latestActiveContract?.ContractType;
                }
            });

        // DTO to Entity mappings
        CreateMap<CreateEmployeeDto, Employee>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.DeletedAt, opt => opt.Ignore())
            .ForMember(dest => dest.DeletedBy, opt => opt.Ignore())
            .ForMember(dest => dest.Department, opt => opt.Ignore())
            .ForMember(dest => dest.Position, opt => opt.Ignore())
            .ForMember(dest => dest.Subordinates, opt => opt.Ignore())
            .ForMember(dest => dest.Contracts, opt => opt.Ignore())
            .ForMember(dest => dest.Educations, opt => opt.Ignore())
            .ForMember(dest => dest.Certifications, opt => opt.Ignore())
            .ForMember(dest => dest.EmployeeRoles, opt => opt.Ignore());

        CreateMap<UpdateEmployeeDto, Employee>()
            // Note: TaxCode is not in UpdateEmployeeDto, so it will preserve existing value
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.DeletedAt, opt => opt.Ignore())
            .ForMember(dest => dest.DeletedBy, opt => opt.Ignore())
            .ForMember(dest => dest.Department, opt => opt.Ignore())
            .ForMember(dest => dest.Position, opt => opt.Ignore())
            .ForMember(dest => dest.Subordinates, opt => opt.Ignore())
            .ForMember(dest => dest.Contracts, opt => opt.Ignore())
            .ForMember(dest => dest.Educations, opt => opt.Ignore())
            .ForMember(dest => dest.Certifications, opt => opt.Ignore())
            .ForMember(dest => dest.EmployeeRoles, opt => opt.Ignore())
            // Preserve TaxCode if not provided in UpdateEmployeeDto
            .ForMember(dest => dest.TaxCode, opt => opt.Ignore());
    }
}
