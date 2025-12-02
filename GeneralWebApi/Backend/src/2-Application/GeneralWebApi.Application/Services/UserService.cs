using System.Security.Cryptography;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Anagraphy;
using GeneralWebApi.DTOs.Users;
using GeneralWebApi.Integration.Repository.AnagraphyRepository;
using GeneralWebApi.Integration.Repository.BasesRepository;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly ILogger<UserService> _logger;

    public UserService(
        IUserRepository userRepository,
        IEmployeeRepository employeeRepository,
        ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _employeeRepository = employeeRepository;
        _logger = logger;
    }

    public async Task<List<UserWithEmployeeDto>> GetUsersWithEmployeeAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting all users with employee information");

        var users = await _userRepository.GetUsersWithEmployeeAsync(cancellationToken);
        return users;
    }

    public async Task<UserWithEmployeeDto> GetUserWithEmployeeAsync(int userId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting user {UserId} with employee information", userId);

        var user = await _userRepository.GetUserWithEmployeeAsync(userId, cancellationToken);
        if (user == null)
        {
            _logger.LogWarning("User with ID {UserId} not found", userId);
            throw new KeyNotFoundException($"User with ID {userId} not found");
        }

        return user;
    }

    public async Task<UserWithEmployeeDto> CreateAsync(CreateUserRequest createDto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Creating user with username: {Username}, email: {Email}", createDto.Username, createDto.Email);

        // Check if username already exists
        if (await _userRepository.ExistsByNameAsync(createDto.Username, cancellationToken))
        {
            _logger.LogWarning("Username {Username} already exists", createDto.Username);
            throw new InvalidOperationException($"Username '{createDto.Username}' is already taken");
        }

        // Check if email already exists
        if (await _userRepository.ExistsByEmailAsync(createDto.Email, cancellationToken))
        {
            _logger.LogWarning("Email {Email} already exists", createDto.Email);
            throw new InvalidOperationException($"Email '{createDto.Email}' is already registered");
        }

        // Generate password hash
        var passwordHash = GeneratePasswordHash(createDto.Password);

        // Create user entity
        var user = new User
        {
            Name = createDto.Username,
            Email = createDto.Email,
            PasswordHash = passwordHash,
            PhoneNumber = createDto.PhoneNumber,
            Role = createDto.Role,
            CreatedBy = "System"
        };

        // Create or link employee if employee information is provided
        if (!string.IsNullOrWhiteSpace(createDto.FirstName) || !string.IsNullOrWhiteSpace(createDto.LastName))
        {
            // Generate unique employee number
            var employeeNumber = await GenerateUniqueEmployeeNumberAsync(cancellationToken);

            var employee = new Employee
            {
                FirstName = createDto.FirstName ?? string.Empty,
                LastName = createDto.LastName ?? string.Empty,
                Email = createDto.Email,
                EmployeeNumber = employeeNumber,
                DepartmentId = createDto.DepartmentId,
                PositionId = createDto.PositionId,
                HireDate = DateTime.UtcNow,
                EmploymentStatus = "Active",
                EmploymentType = "FullTime",
                CreatedBy = "System"
            };

            var createdEmployee = await _employeeRepository.AddAsync(employee, cancellationToken);
            user.EmployeeId = createdEmployee.Id;
        }

        // Save user to database
        var createdUser = await _userRepository.RegisterUserAsync(user, cancellationToken);

        _logger.LogInformation("Successfully created user with ID: {UserId}", createdUser.Id);

        // Return user with employee information
        return await GetUserWithEmployeeAsync(createdUser.Id, cancellationToken);
    }

    public async Task<UserWithEmployeeDto> UpdateAsync(int userId, UpdateUserRequest updateDto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Updating user with ID: {UserId}", userId);

        // Get existing user
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user == null)
        {
            _logger.LogWarning("User with ID {UserId} not found", userId);
            throw new KeyNotFoundException($"User with ID {userId} not found");
        }

        // Check if username is being changed and if new username already exists
        if (!string.IsNullOrWhiteSpace(updateDto.Username) && updateDto.Username != user.Name)
        {
            if (await _userRepository.ExistsByNameAsync(updateDto.Username, cancellationToken))
            {
                _logger.LogWarning("Username {Username} already exists", updateDto.Username);
                throw new InvalidOperationException($"Username '{updateDto.Username}' is already taken");
            }
            user.Name = updateDto.Username;
        }

        // Check if email is being changed and if new email already exists
        if (!string.IsNullOrWhiteSpace(updateDto.Email) && updateDto.Email != user.Email)
        {
            if (await _userRepository.ExistsByEmailAsync(updateDto.Email, cancellationToken))
            {
                _logger.LogWarning("Email {Email} already exists", updateDto.Email);
                throw new InvalidOperationException($"Email '{updateDto.Email}' is already registered");
            }
            user.Email = updateDto.Email;
        }

        // Update other fields if provided
        if (updateDto.PhoneNumber != null)
        {
            user.PhoneNumber = updateDto.PhoneNumber;
        }

        if (!string.IsNullOrWhiteSpace(updateDto.Role))
        {
            user.Role = updateDto.Role;
        }

        user.UpdatedBy = "System";
        user.UpdatedAt = DateTime.UtcNow;
        user.Version = user.Version + 1;

        // Update employee information if provided
        if (user.EmployeeId.HasValue)
        {
            var employee = await _employeeRepository.GetByIdAsync(user.EmployeeId.Value, cancellationToken);
            if (employee != null)
            {
                if (!string.IsNullOrWhiteSpace(updateDto.FirstName))
                {
                    employee.FirstName = updateDto.FirstName;
                }
                if (!string.IsNullOrWhiteSpace(updateDto.LastName))
                {
                    employee.LastName = updateDto.LastName;
                }
                if (updateDto.DepartmentId.HasValue)
                {
                    employee.DepartmentId = updateDto.DepartmentId;
                }
                if (updateDto.PositionId.HasValue)
                {
                    employee.PositionId = updateDto.PositionId;
                }
                if (!string.IsNullOrWhiteSpace(updateDto.Email))
                {
                    employee.Email = updateDto.Email;
                }

                employee.UpdatedBy = "System";
                employee.UpdatedAt = DateTime.UtcNow;
                employee.Version = employee.Version + 1;

                await _employeeRepository.UpdateAsync(employee, cancellationToken);
            }
        }
        else if (!string.IsNullOrWhiteSpace(updateDto.FirstName) || !string.IsNullOrWhiteSpace(updateDto.LastName))
        {
            // Create employee if it doesn't exist but employee info is provided
            var employeeNumber = await GenerateUniqueEmployeeNumberAsync(cancellationToken);
            var employee = new Employee
            {
                FirstName = updateDto.FirstName ?? string.Empty,
                LastName = updateDto.LastName ?? string.Empty,
                Email = user.Email,
                EmployeeNumber = employeeNumber,
                DepartmentId = updateDto.DepartmentId,
                PositionId = updateDto.PositionId,
                HireDate = DateTime.UtcNow,
                EmploymentStatus = "Active",
                EmploymentType = "FullTime",
                CreatedBy = "System"
            };

            var createdEmployee = await _employeeRepository.AddAsync(employee, cancellationToken);
            user.EmployeeId = createdEmployee.Id;
        }

        // Update user
        await _userRepository.UpdateAsync(user, cancellationToken);

        _logger.LogInformation("Successfully updated user with ID: {UserId}", userId);

        // Return updated user with employee information
        return await GetUserWithEmployeeAsync(userId, cancellationToken);
    }

    public async Task<bool> DeleteAsync(int userId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Deleting user with ID: {UserId}", userId);

        // Get existing user
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user == null)
        {
            _logger.LogWarning("User with ID {UserId} not found", userId);
            throw new KeyNotFoundException($"User with ID {userId} not found");
        }

        // Delete user (soft delete via base repository)
        await _userRepository.DeleteAsync(userId, cancellationToken);

        _logger.LogInformation("Successfully deleted user with ID: {UserId}", userId);

        return true;
    }

    private string GeneratePasswordHash(string password)
    {
        // Generate a random salt to hash the password
        byte[] salt = RandomNumberGenerator.GetBytes(128 / 8);

        // Hash the password
        string hashed = Convert.ToBase64String(KeyDerivation.Pbkdf2(
            password: password,
            salt: salt,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: 100000,
            numBytesRequested: 256 / 8
        ));

        // Return the salt and the hashed password together
        return $"{Convert.ToBase64String(salt)}:{hashed}";
    }

    private string GenerateEmployeeNumber()
    {
        // Use fixed prefix "EMP" + first 8 characters of GUID (uppercase)
        return $"EMP{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
    }

    private async Task<string> GenerateUniqueEmployeeNumberAsync(CancellationToken cancellationToken)
    {
        string employeeNumber;
        bool exists;
        int attempts = 0;
        const int maxAttempts = 5;

        do
        {
            employeeNumber = GenerateEmployeeNumber();
            exists = await _employeeRepository.ExistsByEmployeeNumberAsync(employeeNumber, cancellationToken);
            attempts++;

            if (attempts >= maxAttempts)
            {
                throw new InvalidOperationException("Unable to generate unique employee number after maximum attempts");
            }
        } while (exists);

        return employeeNumber;
    }
}

