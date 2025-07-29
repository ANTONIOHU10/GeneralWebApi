namespace GeneralWebApi.Application.Services;

public interface ICSVExportService
{
    Task<byte[]> ExportToCSVAsync<T>(IEnumerable<T> data, string? fileName = null) where T : class;
    Task<byte[]> ExportProductsToCSVAsync(CancellationToken cancellationToken = default);
    Task<byte[]> ExportUsersToCSVAsync(CancellationToken cancellationToken = default);
    Task<byte[]> ExportFileDocumentsToCSVAsync(CancellationToken cancellationToken = default);
    // The type of the data is not known at compile time
    // The dataProvider is a function that returns an IEnumerable of the data
    Task<byte[]> ExportCustomDataToCSVAsync<T>(Func<Task<IEnumerable<T>>> dataProvider, string fileName) where T : class;

}