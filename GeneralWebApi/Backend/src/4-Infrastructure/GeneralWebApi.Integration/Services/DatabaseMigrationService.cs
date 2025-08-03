
using GeneralWebApi.Integration.Context;
using GeneralWebApi.Logging.Templates;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Integration.Services;

//DatabaseMigrationService → EF Core → DbContext → database structure updating

public class DatabaseMigrationService : IDatabaseMigrationService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DatabaseMigrationService> _logger;

    public DatabaseMigrationService(ApplicationDbContext context, ILogger<DatabaseMigrationService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<bool> EnsureCreatedAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var created = await _context.Database.EnsureCreatedAsync(cancellationToken);
            if (created)
            {
                _logger.LogInformation(LogTemplates.Database.DatabaseCreated);
                return true;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, LogTemplates.Database.DatabaseCreatedError);
            return false;
        }

        return false;
    }

    public async Task<bool> EnsureDeletedAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var deleted = await _context.Database.EnsureDeletedAsync(cancellationToken);
            if (deleted)
            {
                _logger.LogInformation(LogTemplates.Database.DatabaseDeleted);
                return true;
            }

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, LogTemplates.Database.DatabaseDeletedError);
            return false;
        }

        return false;
    }

    public async Task<bool> MigrateAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            await _context.Database.MigrateAsync(cancellationToken);
            _logger.LogInformation(LogTemplates.Database.DatabaseMigrated);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, LogTemplates.Database.DatabaseMigratedError);
            return false;
        }
    }
}
