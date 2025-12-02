using GeneralWebApi.Application.Features.Users.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Users;
using MediatR;

namespace GeneralWebApi.Application.Features.Users.Handlers;

public class GetUsersWithEmployeeQueryHandler : IRequestHandler<GetUsersWithEmployeeQuery, List<UserWithEmployeeDto>>
{
    private readonly IUserService _userService;

    public GetUsersWithEmployeeQueryHandler(IUserService userService)
    {
        _userService = userService;
    }

    public async Task<List<UserWithEmployeeDto>> Handle(GetUsersWithEmployeeQuery request, CancellationToken cancellationToken)
    {
        return await _userService.GetUsersWithEmployeeAsync(cancellationToken);
    }
}

