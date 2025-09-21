using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace GeneralWebApi.Identity.Helpers;

/// <summary>
/// Helper class for authorization operations
/// </summary>
public static class AuthorizationHelper
{
    /// <summary>
    /// Check if the current user has a specific role
    /// </summary>
    /// <param name="user">Current user claims principal</param>
    /// <param name="role">Role to check</param>
    /// <returns>True if user has the role</returns>
    public static bool HasRole(ClaimsPrincipal user, string role)
    {
        return user.IsInRole(role);
    }

    /// <summary>
    /// Check if the current user has any of the specified roles
    /// </summary>
    /// <param name="user">Current user claims principal</param>
    /// <param name="roles">Roles to check</param>
    /// <returns>True if user has any of the roles</returns>
    public static bool HasAnyRole(ClaimsPrincipal user, params string[] roles)
    {
        return roles.Any(role => user.IsInRole(role));
    }

    /// <summary>
    /// Check if the current user is an admin
    /// </summary>
    /// <param name="user">Current user claims principal</param>
    /// <returns>True if user is admin</returns>
    public static bool IsAdmin(ClaimsPrincipal user)
    {
        return user.IsInRole("Admin");
    }

    /// <summary>
    /// Check if the current user is a manager or admin
    /// </summary>
    /// <param name="user">Current user claims principal</param>
    /// <returns>True if user is manager or admin</returns>
    public static bool IsManagerOrAdmin(ClaimsPrincipal user)
    {
        return user.IsInRole("Manager") || user.IsInRole("Admin");
    }

    /// <summary>
    /// Get the current user's ID from claims
    /// </summary>
    /// <param name="user">Current user claims principal</param>
    /// <returns>User ID or null if not found</returns>
    public static string? GetUserId(ClaimsPrincipal user)
    {
        return user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }

    /// <summary>
    /// Get the current user's username from claims
    /// </summary>
    /// <param name="user">Current user claims principal</param>
    /// <returns>Username or null if not found</returns>
    public static string? GetUsername(ClaimsPrincipal user)
    {
        return user.FindFirst(ClaimTypes.Name)?.Value;
    }

    /// <summary>
    /// Get the current user's email from claims
    /// </summary>
    /// <param name="user">Current user claims principal</param>
    /// <returns>Email or null if not found</returns>
    public static string? GetUserEmail(ClaimsPrincipal user)
    {
        return user.FindFirst(ClaimTypes.Email)?.Value;
    }

    /// <summary>
    /// Get all roles for the current user
    /// </summary>
    /// <param name="user">Current user claims principal</param>
    /// <returns>Array of user roles</returns>
    public static string[] GetUserRoles(ClaimsPrincipal user)
    {
        return user.Claims
            .Where(c => c.Type == ClaimTypes.Role)
            .Select(c => c.Value)
            .ToArray();
    }

    /// <summary>
    /// Check if the current user can access a specific resource
    /// </summary>
    /// <param name="user">Current user claims principal</param>
    /// <param name="resourceOwnerId">ID of the resource owner</param>
    /// <returns>True if user can access the resource</returns>
    public static bool CanAccessResource(ClaimsPrincipal user, string resourceOwnerId)
    {
        var userId = GetUserId(user);
        var isAdmin = IsAdmin(user);

        // Admin can access all resources
        if (isAdmin)
            return true;

        // User can only access their own resources
        return userId == resourceOwnerId;
    }

    /// <summary>
    /// Check if the current user can manage a specific resource
    /// </summary>
    /// <param name="user">Current user claims principal</param>
    /// <param name="resourceOwnerId">ID of the resource owner</param>
    /// <returns>True if user can manage the resource</returns>
    public static bool CanManageResource(ClaimsPrincipal user, string resourceOwnerId)
    {
        var userId = GetUserId(user);
        var isManagerOrAdmin = IsManagerOrAdmin(user);

        // Manager or Admin can manage all resources
        if (isManagerOrAdmin)
            return true;

        // User can only manage their own resources
        return userId == resourceOwnerId;
    }
}
