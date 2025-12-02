using GeneralWebApi.Application.Features.Users.Commands;
using GeneralWebApi.Application.Services;
using MediatR;

namespace GeneralWebApi.Application.Features.Users.Handlers;

public class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand, bool>
{
    private readonly IUserService _userService;

    public DeleteUserCommandHandler(IUserService userService)
    {
        _userService = userService;
    }

    public async Task<bool> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        return await _userService.DeleteAsync(request.UserId, cancellationToken);
    }
}

