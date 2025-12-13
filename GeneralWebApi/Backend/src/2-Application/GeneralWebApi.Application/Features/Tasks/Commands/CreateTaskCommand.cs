using GeneralWebApi.DTOs.Task;
using MediatR;

namespace GeneralWebApi.Application.Features.Tasks.Commands;

/// <summary>
/// Command for creating a new task
/// </summary>
public class CreateTaskCommand : IRequest<TaskDto>
{
    public CreateTaskDto CreateTaskDto { get; set; } = null!;
}

