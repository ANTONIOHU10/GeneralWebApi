using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GeneralWebApi.Domain.Entities;

/// <summary>
/// User session entity for tracking active user sessions
/// Provides fallback when cache is unavailable
/// </summary>
[Table("UserSessions")]
public class UserSession
{
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// User ID associated with this session
    /// </summary>
    [Required]
    public int UserId { get; set; }

    /// <summary>
    /// Username for quick lookup
    /// </summary>
    [Required]
    [StringLength(100)]
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Access token associated with this session
    /// </summary>
    [Required]
    [StringLength(2000)]
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>
    /// Refresh token associated with this session
    /// </summary>
    [Required]
    [StringLength(500)]
    public string RefreshToken { get; set; } = string.Empty;

    /// <summary>
    /// When the session was created
    /// </summary>
    [Required]
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// When the session was last accessed
    /// </summary>
    [Required]
    public DateTime LastAccessedAt { get; set; }

    /// <summary>
    /// When the session expires
    /// </summary>
    [Required]
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// IP address where the session was created
    /// </summary>
    [StringLength(45)]
    public string? CreatedFromIp { get; set; }

    /// <summary>
    /// User agent when the session was created
    /// </summary>
    [StringLength(500)]
    public string? CreatedFromUserAgent { get; set; }

    /// <summary>
    /// Whether the session is active
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// When the session was ended
    /// </summary>
    public DateTime? EndedAt { get; set; }

    /// <summary>
    /// Reason for session end
    /// </summary>
    [StringLength(100)]
    public string? EndReason { get; set; }

    /// <summary>
    /// Navigation property to User
    /// </summary>
    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }
}
