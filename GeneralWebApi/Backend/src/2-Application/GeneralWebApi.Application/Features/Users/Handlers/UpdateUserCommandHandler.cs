using GeneralWebApi.Application.Features.Users.Commands;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Users;
using MediatR;

namespace GeneralWebApi.Application.Features.Users.Handlers;

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, UserWithEmployeeDto>
{
    private readonly IUserService _userService;

    public UpdateUserCommandHandler(IUserService userService)
    {
        _userService = userService;
    }

    public async Task<UserWithEmployeeDto> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        return await _userService.UpdateAsync(request.UserId, request.UpdateUserRequest, cancellationToken);
    }
}

