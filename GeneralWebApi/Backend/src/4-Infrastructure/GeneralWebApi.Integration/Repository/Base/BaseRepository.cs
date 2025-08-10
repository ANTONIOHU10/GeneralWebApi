using GeneralWebApi.Domain.Entities.Base;
using GeneralWebApi.Integration.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Integration.Repository.Base;

/// <summary>
/// Base repository implementation providing common CRUD operations
/// </summary>
/// <typeparam name="T">Entity type that inherits from BaseEntity</typeparam>
public abstract class BaseRepository<T> : IBaseRepository<T> where T : BaseEntity
{
    protected readonly ApplicationDbContext _context;
    protected readonly DbSet<T> _dbSet;
    protected readonly ILogger<BaseRepository<T>> _logger;

    protected BaseRepository(ApplicationDbContext context, ILogger<BaseRepository<T>> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _dbSet = context.Set<T>();
    }

    #region IBaseRepository Implementation

    public virtual async Task<T> AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        try
        {
            // Set audit fields
            SetAuditFieldsForCreation(entity);

            var result = await _dbSet.AddAsync(entity, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Entity {EntityType} with ID {EntityId} added successfully", typeof(T).Name, entity.Id);
            return result.Entity;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to add entity {EntityType}", typeof(T).Name);
            throw;
        }
    }

    public virtual async Task<IEnumerable<T>> AddRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default)
    {
        try
        {
            var entityList = entities.ToList();

            // Set audit fields for all entities
            foreach (var entity in entityList)
            {
                SetAuditFieldsForCreation(entity);
            }

            await _dbSet.AddRangeAsync(entityList, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Added {Count} entities of type {EntityType}", entityList.Count, typeof(T).Name);
            return entityList;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to add range of entities {EntityType}", typeof(T).Name);
            throw;
        }
    }

    public virtual async Task<T> GetByIdAsync(object id, CancellationToken cancellationToken = default)
    {
        try
        {
            var entity = await _dbSet.FindAsync(new object[] { id }, cancellationToken);

            if (entity == null)
            {
                _logger.LogWarning("Entity {EntityType} with ID {EntityId} not found", typeof(T).Name, id);
                throw new KeyNotFoundException($"Entity of type {typeof(T).Name} with ID {id} not found");
            }

            return entity;
        }
        catch (Exception ex) when (ex is not KeyNotFoundException)
        {
            _logger.LogError(ex, "Failed to get entity {EntityType} with ID {EntityId}", typeof(T).Name, id);
            throw;
        }
    }

    public virtual async Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var entities = await _dbSet.ToListAsync(cancellationToken);
            _logger.LogDebug("Retrieved {Count} entities of type {EntityType}", entities.Count, typeof(T).Name);
            return entities;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get all entities {EntityType}", typeof(T).Name);
            throw;
        }
    }

    public virtual async Task<T> UpdateAsync(T entity, CancellationToken cancellationToken = default)
    {
        try
        {
            // Set audit fields for update
            SetAuditFieldsForUpdate(entity);

            _dbSet.Update(entity);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Entity {EntityType} with ID {EntityId} updated successfully", typeof(T).Name, entity.Id);
            return entity;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update entity {EntityType} with ID {EntityId}", typeof(T).Name, entity.Id);
            throw;
        }
    }

    public virtual async Task<IEnumerable<T>> UpdateRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default)
    {
        try
        {
            var entityList = entities.ToList();

            // Set audit fields for all entities
            foreach (var entity in entityList)
            {
                SetAuditFieldsForUpdate(entity);
            }

            _dbSet.UpdateRange(entityList);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Updated {Count} entities of type {EntityType}", entityList.Count, typeof(T).Name);
            return entityList;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update range of entities {EntityType}", typeof(T).Name);
            throw;
        }
    }

    public virtual async Task<T> DeleteAsync(object id, CancellationToken cancellationToken = default)
    {
        try
        {
            var entity = await GetByIdAsync(id, cancellationToken);

            // Soft delete
            entity.IsDeleted = true;
            entity.DeletedAt = DateTime.UtcNow;
            entity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Entity {EntityType} with ID {EntityId} soft deleted successfully", typeof(T).Name, entity.Id);
            return entity;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete entity {EntityType} with ID {EntityId}", typeof(T).Name, id);
            throw;
        }
    }

    public virtual async Task<IEnumerable<T>> DeleteRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default)
    {
        try
        {
            var entityList = entities.ToList();

            // Soft delete all entities
            foreach (var entity in entityList)
            {
                entity.IsDeleted = true;
                entity.DeletedAt = DateTime.UtcNow;
                entity.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Soft deleted {Count} entities of type {EntityType}", entityList.Count, typeof(T).Name);
            return entityList;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete range of entities {EntityType}", typeof(T).Name);
            throw;
        }
    }

    #endregion

    #region Protected Helper Methods

    /// <summary>
    /// Sets audit fields for entity creation
    /// </summary>
    protected virtual void SetAuditFieldsForCreation(T entity)
    {
        entity.CreatedAt = DateTime.UtcNow;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.IsActive = true;
        entity.Version = 1;
        entity.IsDeleted = false;
    }

    /// <summary>
    /// Sets audit fields for entity update
    /// </summary>
    protected virtual void SetAuditFieldsForUpdate(T entity)
    {
        entity.UpdatedAt = DateTime.UtcNow;
        entity.Version++;
    }

    /// <summary>
    /// Gets active entities only (not deleted)
    /// </summary>
    protected virtual IQueryable<T> GetActiveEntities()
    {
        return _dbSet.Where(e => !e.IsDeleted);
    }

    /// <summary>
    /// Gets active and enabled entities
    /// </summary>
    /// <returns>IQueryable<T> of active and enabled entities</returns>
    /// <remarks>
    /// IQueryable is a lazy loading feature of Entity Framework Core.
    /// It allows you to build queries incrementally and only execute them when you need to.
    /// It will be executed when you call toList, toArray, FirstOrDefaultAsync, etc.
    protected virtual IQueryable<T> GetActiveAndEnabledEntities()
    {
        return _dbSet.Where(e => !e.IsDeleted && e.IsActive);
    }

    #endregion
}