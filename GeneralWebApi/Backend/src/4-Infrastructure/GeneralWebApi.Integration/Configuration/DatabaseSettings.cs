namespace GeneralWebApi.Integration.Configuration;
//appsettings.json → DatabaseSettings → ServiceCollectionExtensions -> DI container
public class DatabaseSettings
{
    public const string SectionName = "Database";

    // for the appsettings.json properties
    public string ConnectionString { get; set; } = string.Empty;
    public string Provider { get; set; } = "SqlServer";
    public int CommandTimeout { get; set; } = 30;
    public bool EnableRetryOnFailure { get; set; } = true;
    public int MaxRetryCount { get; set; } = 3;
    public int RetryDelaySeconds { get; set; } = 5;
    public bool EnableSensitiveDataLogging { get; set; } = false;
    public bool EnableDetailedErrors { get; set; } = false;
    public int PoolSize { get; set; } = 128;
}

public class DatabaseOptions
{
    public const string SectionName = "Database";

    // for the appsettings.json properties
    public string DefaultConnection { get; set; } = string.Empty;
    public string ReadOnlyConnection { get; set; } = string.Empty;
    public string WriteConnection { get; set; } = string.Empty;
    public DatabaseSettings Settings { get; set; } = new();
}