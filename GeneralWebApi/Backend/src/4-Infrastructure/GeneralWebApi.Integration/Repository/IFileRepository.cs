using GeneralWebApi.Domain.Entities;

namespace GeneralWebApi.Integration.Repository;

public interface IFileDocumentRepository : IBaseRepository<FileDocument>
{
    Task<FileDocument> GetByFileNameAsync(string fileName, CancellationToken cancellationToken = default);
    Task<List<FileDocument>> GetAllFileDocumentsAsync(CancellationToken cancellationToken = default);
    Task<FileDocument> AddFileDocumentAsync(FileDocument fileDocument, CancellationToken cancellationToken = default);
    Task<FileDocument> UpdateFileDocumentAsync(FileDocument fileDocument, CancellationToken cancellationToken = default);
    Task<FileDocument> DeleteFileDocumentAsync(string fileName, CancellationToken cancellationToken = default);
    Task<List<FileDocument>> DeleteAllFileDocumentsAsync(CancellationToken cancellationToken = default);

    Task<bool> ExistsByFileNameAsync(string fileName, CancellationToken cancellationToken = default);
    Task<FileDocument> AddFileDocumentWithContentAsync(string fileName, byte[] content, string fileExtension, string contentType, CancellationToken cancellationToken = default);
    Task<byte[]> GetFileContentAsync(string fileName, CancellationToken cancellationToken = default);
    Task<FileDocument> UpdateFileContentAsync(string fileName, byte[] newContent, CancellationToken cancellationToken = default);
}