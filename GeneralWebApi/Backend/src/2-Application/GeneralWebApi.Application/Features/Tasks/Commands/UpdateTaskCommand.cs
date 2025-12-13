using GeneralWebApi.DTOs.Task;
using MediatR;

namespace GeneralWebApi.Application.Features.Tasks.Commands;

/// <summary>
/// Command for updating an existing task
/// </summary>
public class UpdateTaskCommand : IRequest<TaskDto>
{
    public UpdateTaskDto UpdateTaskDto { get; set; } = null!;
}

