using GeneralWebApi.DTOs.Task;
using MediatR;

namespace GeneralWebApi.Application.Features.Tasks.Queries;

/// <summary>
/// Query for getting a task by ID
/// </summary>
public class GetTaskByIdQuery : IRequest<TaskDto>
{
    public int Id { get; set; }
}

