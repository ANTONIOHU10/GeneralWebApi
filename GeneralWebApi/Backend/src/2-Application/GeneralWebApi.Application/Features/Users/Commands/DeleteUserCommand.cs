using MediatR;

namespace GeneralWebApi.Application.Features.Users.Commands;

public class DeleteUserCommand : IRequest<bool>
{
    public int UserId { get; set; }
}

