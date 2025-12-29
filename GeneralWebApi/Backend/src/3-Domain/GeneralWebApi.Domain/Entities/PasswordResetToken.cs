using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GeneralWebApi.Domain.Entities;

/// <summary>
/// Password reset token entity for database storage
/// Used for password reset functionality
/// </summary>
[Table("PasswordResetTokens")]
public class PasswordResetToken
{
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// The reset token value (hashed for security)
    /// </summary>
    [Required]
    [StringLength(500)]
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// User ID associated with this reset token
    /// </summary>
    [Required]
    public int UserId { get; set; }

    /// <summary>
    /// User email for quick lookup
    /// </summary>
    [Required]
    [StringLength(255)]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Token expiration time (typically 15-30 minutes)
    /// </summary>
    [Required]
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// When the token was created
    /// </summary>
    [Required]
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// When the token was used (null if not used yet)
    /// </summary>
    public DateTime? UsedAt { get; set; }

    /// <summary>
    /// Whether the token is used
    /// </summary>
    public bool IsUsed { get; set; } = false;

    /// <summary>
    /// IP address where the token was requested
    /// </summary>
    [StringLength(45)]
    public string? RequestedFromIp { get; set; }

    /// <summary>
    /// User agent when the token was requested
    /// </summary>
    [StringLength(500)]
    public string? RequestedFromUserAgent { get; set; }

    /// <summary>
    /// Navigation property to User
    /// </summary>
    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }
}

