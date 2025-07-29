
using System.Globalization;
using System.Text;
using CsvHelper;
using GeneralWebApi.Integration.Repository;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Application.Services;

public class CSVExportService(ILogger<CSVExportService> logger, IUserRepository userRepository, IProductRepository productRepository, IFileDocumentRepository fileDocumentRepository) : ICSVExportService
{

    private readonly ILogger<CSVExportService> _logger = logger;
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IProductRepository _productRepository = productRepository;
    private readonly IFileDocumentRepository _fileDocumentRepository = fileDocumentRepository;
    public async Task<byte[]> ExportToCSVAsync<T>(IEnumerable<T> data, string? fileName = null) where T : class
    {
        try
        {
            using var memoryStream = new MemoryStream();
            using var streamWriter = new StreamWriter(memoryStream, Encoding.UTF8);
            using var csvWriter = new CsvWriter(streamWriter, CultureInfo.InvariantCulture);

            await csvWriter.WriteRecordsAsync(data);
            await streamWriter.FlushAsync();
            _logger.LogInformation("CSV file exported successfully for {fileName}", fileName);

            return memoryStream.ToArray();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting custom data to CSV");
            throw;
        }
    }
    public async Task<byte[]> ExportCustomDataToCSVAsync<T>(Func<Task<IEnumerable<T>>> dataProvider, string fileName) where T : class
    {
        var data = await dataProvider();
        return await ExportToCSVAsync(data, fileName);
    }

    public async Task<byte[]> ExportFileDocumentsToCSVAsync(CancellationToken cancellationToken = default)
    {
        var fileDocuments = await _fileDocumentRepository.GetAllAsync(cancellationToken);
        return await ExportToCSVAsync(fileDocuments, "fileDocuments.csv");
    }

    public async Task<byte[]> ExportProductsToCSVAsync(CancellationToken cancellationToken = default)
    {
        var products = await _productRepository.GetAllAsync(cancellationToken);
        return await ExportToCSVAsync(products, "products.csv");
    }

    public async Task<byte[]> ExportUsersToCSVAsync(CancellationToken cancellationToken = default)
    {
        var users = await _userRepository.GetAllAsync(cancellationToken);
        return await ExportToCSVAsync(users, "users.csv");
    }
}