using GeneralWebApi.Application.Features.Users.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Users;
using MediatR;

namespace GeneralWebApi.Application.Features.Users.Handlers;

public class GetUserWithEmployeeQueryHandler : IRequestHandler<GetUserWithEmployeeQuery, UserWithEmployeeDto>
{
    private readonly IUserService _userService;

    public GetUserWithEmployeeQueryHandler(IUserService userService)
    {
        _userService = userService;
    }

    public async Task<UserWithEmployeeDto> Handle(GetUserWithEmployeeQuery request, CancellationToken cancellationToken)
    {
        return await _userService.GetUserWithEmployeeAsync(request.UserId, cancellationToken);
    }
}

