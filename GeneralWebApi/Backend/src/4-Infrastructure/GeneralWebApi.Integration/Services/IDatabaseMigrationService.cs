namespace GeneralWebApi.Integration.Services;

public interface IDatabaseMigrationService
{
    Task<bool> MigrateAsync(CancellationToken cancellationToken = default);
    Task<bool> EnsureCreatedAsync(CancellationToken cancellationToken = default);
    Task<bool> EnsureDeletedAsync(CancellationToken cancellationToken = default);
}