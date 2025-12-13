using AutoMapper;
using GeneralWebApi.Domain.Entities.Tasks;
using GeneralWebApi.DTOs.Task;
using TaskEntity = GeneralWebApi.Domain.Entities.Tasks.Task;

namespace GeneralWebApi.Application.Mappings;

/// <summary>
/// AutoMapper profile for Task entity mappings
/// </summary>
public class TaskMappingProfile : Profile
{
    public TaskMappingProfile()
    {
        CreateMap<TaskEntity, TaskDto>();
        CreateMap<CreateTaskDto, TaskEntity>();
        CreateMap<UpdateTaskDto, TaskEntity>()
            .ForMember(dest => dest.UserId, opt => opt.Ignore()); // UserId should not be updated
        CreateMap<TaskEntity, TaskListDto>();
    }
}

