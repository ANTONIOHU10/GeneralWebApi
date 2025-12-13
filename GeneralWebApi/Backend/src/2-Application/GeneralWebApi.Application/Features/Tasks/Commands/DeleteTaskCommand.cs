using MediatR;

namespace GeneralWebApi.Application.Features.Tasks.Commands;

/// <summary>
/// Command for deleting a task
/// </summary>
public class DeleteTaskCommand : IRequest<bool>
{
    public int Id { get; set; }
}

