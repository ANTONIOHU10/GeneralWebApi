using Dapper;
using GeneralWebApi.Integration.Configuration;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace GeneralWebApi.Integration.Services;

// DatabaseService → Dapper → SqlConnection → execute SQL → return result

public class DatabaseService : IDatabaseService
{
    private readonly DatabaseSettings _databaseSettings;
    private readonly ILogger<DatabaseService> _logger;

    public DatabaseService(IOptions<DatabaseSettings> databaseSettings, ILogger<DatabaseService> logger)
    {
        _databaseSettings = databaseSettings.Value;
        _logger = logger;
    }

    public async Task<int> ExecuteAsync(string sql, object? parameters = null, CancellationToken cancellationToken = default)
    {
        using var connection = new SqlConnection(_databaseSettings.ConnectionString);
            return await Task.Run(async () =>
        {
            cancellationToken.ThrowIfCancellationRequested();
            return await connection.ExecuteAsync(sql, parameters, commandTimeout: _databaseSettings.CommandTimeout, commandType: System.Data.CommandType.Text);
        }, cancellationToken);
    }

    // IsHealthyAsync → check if the database is healthy -> connection test -> query test
    public async Task<bool> IsHealthyAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            using var connection = new SqlConnection(_databaseSettings.ConnectionString);
            await connection.OpenAsync(cancellationToken);
            
            var result = await connection.QueryFirstOrDefaultAsync<int>(
                "SELECT 1",
                commandTimeout: _databaseSettings.CommandTimeout,
                commandType: System.Data.CommandType.Text
            );

            return result == 1;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking database health");
            return false;
        }
    }

    public async Task<IEnumerable<T>> QueryAsync<T>(string sql, object? parameters = null, CancellationToken cancellationToken = default)
    {
        using var connection = new SqlConnection(_databaseSettings.ConnectionString);
        return await Task.Run(async () =>
        {
            cancellationToken.ThrowIfCancellationRequested();
            return await connection.QueryAsync<T>(sql, parameters, commandTimeout: _databaseSettings.CommandTimeout, commandType: System.Data.CommandType.Text);
        }, cancellationToken);
    }

    public async Task<T> QueryFirstAsync<T>(string sql, object? parameters = null, CancellationToken cancellationToken = default)
    {
        using var connection = new SqlConnection(_databaseSettings.ConnectionString);
            return await Task.Run(async () =>
        {
            cancellationToken.ThrowIfCancellationRequested();
            return await connection.QueryFirstAsync<T>(sql, parameters, commandTimeout: _databaseSettings.CommandTimeout, commandType: System.Data.CommandType.Text);
        }, cancellationToken);
    }

    public async Task<T?> QueryFirstOrDefaultAsync<T>(string sql, object? parameters = null, CancellationToken cancellationToken = default)
    {
        using var connection = new SqlConnection(_databaseSettings.ConnectionString);
        return await Task.Run(async () =>
        {
            cancellationToken.ThrowIfCancellationRequested();
            return await connection.QueryFirstOrDefaultAsync<T>(sql, parameters, commandTimeout: _databaseSettings.CommandTimeout, commandType: System.Data.CommandType.Text);
        }, cancellationToken);
    }

    public async Task<IEnumerable<T>> QueryMultipleAsync<T>(string sql, object? parameters = null, CancellationToken cancellationToken = default)
    {
        using var connection = new SqlConnection(_databaseSettings.ConnectionString);
        return await Task.Run(async () =>
        {
            cancellationToken.ThrowIfCancellationRequested();
            return await connection.QueryAsync<T>(sql, parameters, commandTimeout: _databaseSettings.CommandTimeout, commandType: System.Data.CommandType.Text);
        }, cancellationToken);
    }
}