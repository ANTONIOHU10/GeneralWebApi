namespace GeneralWebApi.DTOs.Common;

/// <summary>
/// Enum Value DTO
/// </summary>
public class EnumValueDto
{
    /// <summary>
    /// Enum value
    /// </summary>
    public string Value { get; set; } = string.Empty;

    /// <summary>
    /// Display name
    /// </summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>
    /// Description
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Sort order
    /// </summary>
    public int SortOrder { get; set; } = 0;

    /// <summary>
    /// Is default value
    /// </summary>
    public bool IsDefault { get; set; } = false;
}

/// <summary>
/// Enum Value Group DTO
/// </summary>
public class EnumValueGroupDto
{
    /// <summary>
    /// Group name
    /// </summary>
    public string GroupName { get; set; } = string.Empty;

    /// <summary>
    /// Group display name
    /// </summary>
    public string GroupDisplayName { get; set; } = string.Empty;

    /// <summary>
    /// Enum values list
    /// </summary>
    public List<EnumValueDto> Values { get; set; } = new();
}

/// <summary>
/// All Enum Values Response DTO
/// </summary>
public class EnumValuesResponse
{
    /// <summary>
    /// Enum value groups dictionary
    /// </summary>
    public Dictionary<string, EnumValueGroupDto> Groups { get; set; } = new();

    /// <summary>
    /// Last updated time
    /// </summary>
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Specific Enum Values Response DTO
/// </summary>
public class SpecificEnumValuesResponse
{
    /// <summary>
    /// Enum values list
    /// </summary>
    public List<EnumValueDto> Values { get; set; } = new();

    /// <summary>
    /// Group name
    /// </summary>
    public string GroupName { get; set; } = string.Empty;

    /// <summary>
    /// Last updated time
    /// </summary>
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}

