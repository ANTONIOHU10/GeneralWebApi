using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GeneralWebApi.Domain.Entities;

/// <summary>
/// Refresh token entity for database storage
/// Provides fallback when cache is unavailable
/// </summary>
[Table("RefreshTokens")]
public class RefreshToken
{
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// The refresh token value
    /// </summary>
    [Required]
    [StringLength(500)]
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// User ID associated with this refresh token
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
    /// Token expiration time
    /// </summary>
    [Required]
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// When the token was created
    /// </summary>
    [Required]
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// When the token was last used
    /// </summary>
    public DateTime? LastUsedAt { get; set; }

    /// <summary>
    /// Whether the token is revoked
    /// </summary>
    public bool IsRevoked { get; set; } = false;

    /// <summary>
    /// IP address where the token was created
    /// </summary>
    [StringLength(45)]
    public string? CreatedFromIp { get; set; }

    /// <summary>
    /// User agent when the token was created
    /// </summary>
    [StringLength(500)]
    public string? CreatedFromUserAgent { get; set; }

    /// <summary>
    /// Navigation property to User
    /// </summary>
    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }
}
