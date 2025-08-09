using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Integration.Context;
using Microsoft.EntityFrameworkCore;

namespace GeneralWebApi.Integration.Repository;

public class ExternalApiConfigRepository : IExternalApiConfigRepository
{
    private readonly ApplicationDbContext _context;

    public ExternalApiConfigRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ExternalApiConfig> AddAsync(ExternalApiConfig entity, CancellationToken cancellationToken = default)
    {
        await _context.ExternalApiConfigs.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<IEnumerable<ExternalApiConfig>> AddRangeAsync(IEnumerable<ExternalApiConfig> entities, CancellationToken cancellationToken = default)
    {
        await _context.ExternalApiConfigs.AddRangeAsync(entities, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return entities;
    }

    public async Task<ExternalApiConfig> GetByIdAsync(object id, CancellationToken cancellationToken = default)
    {
        return await _context.ExternalApiConfigs.FindAsync(new object[] { id }, cancellationToken) ?? throw new Exception("ExternalApiConfig not found");
    }

    public async Task<IEnumerable<ExternalApiConfig>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.ExternalApiConfigs.ToListAsync(cancellationToken);
    }

    public async Task<ExternalApiConfig> UpdateAsync(ExternalApiConfig entity, CancellationToken cancellationToken = default)
    {
        _context.ExternalApiConfigs.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<IEnumerable<ExternalApiConfig>> UpdateRangeAsync(IEnumerable<ExternalApiConfig> entities, CancellationToken cancellationToken = default)
    {
        _context.ExternalApiConfigs.UpdateRange(entities);
        await _context.SaveChangesAsync(cancellationToken);
        return entities;
    }

    public async Task<ExternalApiConfig> DeleteAsync(object id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity != null)
        {
            _context.ExternalApiConfigs.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }
        return entity;
    }

    public async Task<IEnumerable<ExternalApiConfig>> DeleteRangeAsync(IEnumerable<ExternalApiConfig> entities, CancellationToken cancellationToken = default)
    {
        _context.ExternalApiConfigs.RemoveRange(entities);
        await _context.SaveChangesAsync(cancellationToken);
        return entities;
    }

    public async Task<ExternalApiConfig?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await _context.ExternalApiConfigs
            .FirstOrDefaultAsync(x => x.Name == name && x.IsActive, cancellationToken);
    }

}