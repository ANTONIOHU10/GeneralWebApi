using GeneralWebApi.DTOs.Users;
using MediatR;

namespace GeneralWebApi.Application.Features.Users.Queries;

public class GetUsersWithEmployeeQuery : IRequest<List<UserWithEmployeeDto>>
{
}

