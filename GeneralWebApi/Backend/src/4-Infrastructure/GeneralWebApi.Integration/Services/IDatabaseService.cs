namespace GeneralWebApi.Integration.Services;

public interface IDatabaseService
{
    Task<bool> IsHealthyAsync(CancellationToken cancellationToken = default);
    Task<int> ExecuteAsync(string sql, object? parameters = null, CancellationToken cancellationToken = default);
    Task<IEnumerable<T>> QueryAsync<T>(string sql, object? parameters = null, CancellationToken cancellationToken = default);
    Task<T?> QueryFirstOrDefaultAsync<T>(string sql, object? parameters = null, CancellationToken cancellationToken = default);
    Task<T> QueryFirstAsync<T>(string sql, object? parameters = null, CancellationToken cancellationToken = default);
    Task<IEnumerable<T>> QueryMultipleAsync<T>(string sql, object? parameters = null, CancellationToken cancellationToken = default);
}