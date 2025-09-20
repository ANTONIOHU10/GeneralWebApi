using AutoMapper;
using GeneralWebApi.Domain.Entities.Documents;
using GeneralWebApi.DTOs.Contract;

namespace GeneralWebApi.Application.Mappings;

public class ContractMappingProfile : Profile
{
    public ContractMappingProfile()
    {
        CreateMap<Contract, ContractDto>()
            .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => src.Employee != null ? $"{src.Employee.FirstName} {src.Employee.LastName}" : null));

        CreateMap<CreateContractDto, Contract>();

        CreateMap<UpdateContractDto, Contract>();

        CreateMap<Contract, ContractListDto>()
            .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => src.Employee != null ? $"{src.Employee.FirstName} {src.Employee.LastName}" : null));
    }
}



