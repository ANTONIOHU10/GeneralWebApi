using GeneralWebApi.DTOs.Users;
using MediatR;

namespace GeneralWebApi.Application.Features.Users.Queries;

public class GetUserWithEmployeeQuery : IRequest<UserWithEmployeeDto>
{
    public int UserId { get; set; }
}

