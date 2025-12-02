using GeneralWebApi.Application.Features.Users.Commands;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Users;
using MediatR;

namespace GeneralWebApi.Application.Features.Users.Handlers;

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, UserWithEmployeeDto>
{
    private readonly IUserService _userService;

    public CreateUserCommandHandler(IUserService userService)
    {
        _userService = userService;
    }

    public async Task<UserWithEmployeeDto> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        return await _userService.CreateAsync(request.CreateUserRequest, cancellationToken);
    }
}

