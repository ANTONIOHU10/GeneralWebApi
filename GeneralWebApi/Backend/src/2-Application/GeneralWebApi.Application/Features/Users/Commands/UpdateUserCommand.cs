using GeneralWebApi.DTOs.Users;
using MediatR;

namespace GeneralWebApi.Application.Features.Users.Commands;

public class UpdateUserCommand : IRequest<UserWithEmployeeDto>
{
    public int UserId { get; set; }
    public UpdateUserRequest UpdateUserRequest { get; set; } = null!;
}

