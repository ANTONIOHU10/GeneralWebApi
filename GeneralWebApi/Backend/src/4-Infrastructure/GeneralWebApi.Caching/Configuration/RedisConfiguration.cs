namespace GeneralWebApi.Caching.Configuration;

public class RedisConfiguration
{
    public string? ConnectionString { get; set; }
    public string? InstanceName { get; set; }
    public int Database { get; set; }
    public int ConnectTimeout { get; set; }
    public int SyncTimeout { get; set; }
    public bool AbortConnect { get; set; }
}