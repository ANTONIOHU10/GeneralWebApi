using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Task;
using MediatR;

namespace GeneralWebApi.Application.Features.Tasks.Queries;

/// <summary>
/// Query for getting paginated tasks
/// </summary>
public class GetTasksQuery : IRequest<PagedResult<TaskListDto>>
{
    public TaskSearchDto? SearchDto { get; set; }
}

