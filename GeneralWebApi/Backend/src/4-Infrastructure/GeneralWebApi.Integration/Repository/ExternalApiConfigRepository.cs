using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Integration.Context;
using GeneralWebApi.Integration.Repository.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using GeneralWebApi.Logging.Templates;

namespace GeneralWebApi.Integration.Repository;

public class ExternalApiConfigRepository : BaseRepository<ExternalApiConfig>, IExternalApiConfigRepository
{
    public ExternalApiConfigRepository(ApplicationDbContext context, ILogger<ExternalApiConfigRepository> logger)
        : base(context, logger)
    {
    }

    #region ExternalApiConfig-specific business methods

    public async Task<ExternalApiConfig?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        try
        {
            var config = await _dbSet
                .FirstOrDefaultAsync(x => x.Name == name && x.IsActive, cancellationToken);

            if (config == null)
            {
                _logger.LogDebug(LogTemplates.Repository.ExternalApiConfigNotFound, name);
            }

            return config;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, LogTemplates.Repository.ExternalApiConfigGetFailed, name);
            throw;
        }
    }

    #endregion

    #region Override base methods if needed

    // Override GetAllAsync to only return active configurations
    public override async Task<IEnumerable<ExternalApiConfig>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities().ToListAsync(cancellationToken);
    }

    #endregion
}