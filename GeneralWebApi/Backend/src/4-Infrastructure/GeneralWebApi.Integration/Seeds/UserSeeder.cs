using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Enums;
using GeneralWebApi.Integration.Context;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;

namespace GeneralWebApi.Integration.Seeds;

/// <summary>
/// User seeder for initializing default users with different roles
/// </summary>
public class UserSeeder
{
    /// <summary>
    /// Seeds default users for different roles if they don't exist
    /// </summary>
    /// <param name="dbContext">Database context</param>
    /// <returns>Task representing the async operation</returns>
    public static async Task SeedAsync(ApplicationDbContext dbContext)
    {
        // Check if any users exist at all
        if (!dbContext.Users.Any())
        {
            var users = new List<User>();

            // Create Admin user
            users.Add(CreateUser("admin", "admin@generalwebapi.com", "Admin@123456", Role.Admin, "+1234567890", 1));

            // Create Manager user
            users.Add(CreateUser("manager", "manager@generalwebapi.com", "Manager@123456", Role.Manager, "+1234567891", 2));

            // Create a regular User for testing
            users.Add(CreateUser("user", "user@generalwebapi.com", "User@123456", Role.User, "+1234567892", 3));

            await dbContext.Users.AddRangeAsync(users);
            await dbContext.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Creates a user with the specified parameters
    /// </summary>
    /// <param name="username">Username</param>
    /// <param name="email">Email address</param>
    /// <param name="password">Plain text password</param>
    /// <param name="role">User role</param>
    /// <param name="phoneNumber">Phone number</param>
    /// <param name="sortOrder">Sort order</param>
    /// <returns>User entity</returns>
    private static User CreateUser(string username, string email, string password, Role role, string phoneNumber, int sortOrder)
    {
        var passwordHash = GeneratePasswordHash(password);

        return new User
        {
            Name = username,
            Email = email,
            PasswordHash = passwordHash,
            PhoneNumber = phoneNumber,
            Role = role.ToString(),
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "System",
            IsActive = true,
            IsDeleted = false,
            Version = 1,
            SortOrder = sortOrder
        };
    }

    /// <summary>
    /// Generates a password hash using the same algorithm as UserService
    /// </summary>
    /// <param name="password">Plain text password</param>
    /// <returns>Hashed password with salt</returns>
    private static string GeneratePasswordHash(string password)
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
}
