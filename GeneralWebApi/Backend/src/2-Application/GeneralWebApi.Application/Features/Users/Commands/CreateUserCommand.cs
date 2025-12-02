using GeneralWebApi.DTOs.Users;
using MediatR;

namespace GeneralWebApi.Application.Features.Users.Commands;

public class CreateUserCommand : IRequest<UserWithEmployeeDto>
{
    public CreateUserRequest CreateUserRequest { get; set; } = null!;
}

