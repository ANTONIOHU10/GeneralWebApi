namespace GeneralWebApi.Integration.Repository;

// here T is the entity type (class)
public interface IBaseRepository<T> where T : class
{

    #region Basic CRUD operations

    // Creation
    Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);
    Task<IEnumerable<T>> AddRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default);

    // Read
    Task<T> GetByIdAsync(object id, CancellationToken cancellationToken = default);
    Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default);

    // Update
    Task<T> UpdateAsync(T entity, CancellationToken cancellationToken = default);
    Task<IEnumerable<T>> UpdateRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default);

    // Delete
    Task<T> DeleteAsync(object id, CancellationToken cancellationToken = default);
    Task<IEnumerable<T>> DeleteRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default);

    #endregion
}

