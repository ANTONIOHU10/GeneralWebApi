using GeneralWebApi.DTOs.Users;

namespace GeneralWebApi.Application.Services;

public interface IUserService
{
    Task<List<UserWithEmployeeDto>> GetUsersWithEmployeeAsync(CancellationToken cancellationToken = default);
    Task<UserWithEmployeeDto> GetUserWithEmployeeAsync(int userId, CancellationToken cancellationToken = default);
    Task<UserWithEmployeeDto> CreateAsync(CreateUserRequest createDto, CancellationToken cancellationToken = default);
    Task<UserWithEmployeeDto> UpdateAsync(int userId, UpdateUserRequest updateDto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int userId, CancellationToken cancellationToken = default);
}

