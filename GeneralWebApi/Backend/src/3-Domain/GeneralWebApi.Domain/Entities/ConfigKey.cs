namespace GeneralWebApi.Domain.Entities;

public class ConfigKey
{
    public int Id { get; set; }
    public string Value { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}