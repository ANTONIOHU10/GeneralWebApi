using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Integration.Repository;
using Microsoft.EntityFrameworkCore;

namespace GeneralWebApi.FileOperation.Services;

public class FileCommonService : IFileCommonService
{
    private readonly IFileDocumentRepository _fileDocumentRepository;

    public FileCommonService(IFileDocumentRepository fileDocumentRepository)
    {
        _fileDocumentRepository = fileDocumentRepository;
    }

    public async Task<IEnumerable<FileDocument>> GetAllFilesAsync(CancellationToken cancellationToken = default)
    {
        return await _fileDocumentRepository.GetAllFileDocumentsAsync(cancellationToken);
    }

    #region Read Operations

    public async Task<FileDocument> GetFileByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _fileDocumentRepository.GetByIdAsync(id, cancellationToken);
    }

    public async Task<FileDocument> GetFileByFileNameAsync(string fileName, CancellationToken cancellationToken = default)
    {
        return await _fileDocumentRepository.GetByFileNameAsync(fileName, cancellationToken);
    }

    public async Task<IEnumerable<FileDocument>> GetAllFilesAsync(int page = 1, int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var allFiles = await _fileDocumentRepository.GetAllFileDocumentsAsync(cancellationToken);
        return allFiles.Skip((page - 1) * pageSize).Take(pageSize);
    }



    #endregion

    #region Write Operations

    public async Task<FileDocument> UpdateFileMetadataAsync(FileDocument fileDocument, CancellationToken cancellationToken = default)
    {
        return await _fileDocumentRepository.UpdateFileDocumentAsync(fileDocument, cancellationToken);
    }

    public async Task<FileDocument> UpdateFileContentAsync(string fileName, byte[] newContent, CancellationToken cancellationToken = default)
    {
        return await _fileDocumentRepository.UpdateFileContentAsync(fileName, newContent, cancellationToken);
    }

    #endregion

    #region Delete Operations

    public async Task<FileDocument> DeleteFileAsync(string fileName, CancellationToken cancellationToken = default)
    {
        return await _fileDocumentRepository.DeleteFileDocumentAsync(fileName, cancellationToken);
    }

    public async Task<FileDocument> DeleteFileByFileNameAsync(string fileName, CancellationToken cancellationToken = default)
    {
        return await _fileDocumentRepository.DeleteFileDocumentAsync(fileName, cancellationToken);
    }

    public async Task<FileDocument> DeleteFileByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _fileDocumentRepository.DeleteAsync(id, cancellationToken);
    }

    public async Task<IEnumerable<FileDocument>> DeleteAllFilesAsync(CancellationToken cancellationToken = default)
    {
        return await _fileDocumentRepository.DeleteAllFileDocumentsAsync(cancellationToken);
    }

    #endregion

    #region Utility Operations

    public async Task<int> GetFileCountAsync(CancellationToken cancellationToken = default)
    {
        // Query file count directly from database without loading any data
        return await _fileDocumentRepository.CountAsync(cancellationToken);
    }

    #endregion
}