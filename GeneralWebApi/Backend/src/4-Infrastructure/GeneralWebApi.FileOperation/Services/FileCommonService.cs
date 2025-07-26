using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Integration.Repository;
using Microsoft.EntityFrameworkCore;

namespace GeneralWebApi.FileOperation.Services;

public class FileCommonService : IFileCommonService
{
    private readonly IFileDocumentRepository _fileDocumentRepository;
    private readonly LocalFileStorageService _fileStorageService;

    public FileCommonService(IFileDocumentRepository fileDocumentRepository, LocalFileStorageService fileStorageService)
    {
        _fileDocumentRepository = fileDocumentRepository;
        _fileStorageService = fileStorageService;
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



    public async Task<Stream> GetFileStreamAsync(int fileId, CancellationToken cancellationToken = default)
    {
        var fileDocument = await _fileDocumentRepository.GetByIdAsync(fileId, cancellationToken);
        if (fileDocument == null)
        {
            throw new FileNotFoundException($"File with ID {fileId} not found");
        }

        return await _fileStorageService.GetFileStreamAsync(fileDocument.FilePath, cancellationToken);
    }

    public async Task<Stream> GetFileStreamByFileNameAsync(string fileName, CancellationToken cancellationToken = default)
    {
        var fileDocument = await _fileDocumentRepository.GetByFileNameAsync(fileName, cancellationToken);
        if (fileDocument == null)
        {
            throw new FileNotFoundException($"File with name {fileName} not found");
        }

        return await _fileStorageService.GetFileStreamAsync(fileDocument.FilePath, cancellationToken);
    }

    public async Task<IEnumerable<FileDocument>> GetAllFilesAsync(int page = 1, int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var allFiles = await _fileDocumentRepository.GetAllFileDocumentsAsync(cancellationToken);
        return allFiles.Skip((page - 1) * pageSize).Take(pageSize);
    }

    #endregion

    #region Write Operations

    #endregion

    #region Delete Operations

    public async Task<FileDocument> DeleteFileAsync(string fileName, CancellationToken cancellationToken = default)
    {
        return await DeleteFileByFileNameAsync(fileName, cancellationToken);
    }

    public async Task<FileDocument> DeleteFileByFileNameAsync(string fileName, CancellationToken cancellationToken = default)
    {
        var fileDocument = await _fileDocumentRepository.GetByFileNameAsync(fileName, cancellationToken);
        if (fileDocument == null)
        {
            throw new FileNotFoundException($"File with name {fileName} not found");
        }

        // Delete from local file system
        await _fileStorageService.DeleteFileAsync(fileDocument.FilePath, cancellationToken);

        // Delete from database
        return await _fileDocumentRepository.DeleteFileDocumentAsync(fileName, cancellationToken);
    }

    public async Task<FileDocument> DeleteFileByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var fileDocument = await _fileDocumentRepository.GetByIdAsync(id, cancellationToken);
        if (fileDocument == null)
        {
            throw new FileNotFoundException($"File with ID {id} not found");
        }

        // Delete from local file system
        await _fileStorageService.DeleteFileAsync(fileDocument.FilePath, cancellationToken);

        // Delete from database
        return await _fileDocumentRepository.DeleteAsync(id, cancellationToken);
    }

    public async Task<IEnumerable<FileDocument>> DeleteAllFilesAsync(CancellationToken cancellationToken = default)
    {
        var allFiles = await _fileDocumentRepository.GetAllFileDocumentsAsync(cancellationToken);
        var deletedFiles = new List<FileDocument>();

        foreach (var file in allFiles)
        {
            // Delete from local file system
            await _fileStorageService.DeleteFileAsync(file.FilePath, cancellationToken);

            // Delete from database
            var deletedFile = await _fileDocumentRepository.DeleteAsync(file.Id, cancellationToken);
            deletedFiles.Add(deletedFile);
        }

        return deletedFiles;
    }

    #endregion

    #region Utility Operations

    public async Task<int> GetFileCountAsync(CancellationToken cancellationToken = default)
    {
        return await _fileDocumentRepository.CountAsync(cancellationToken);
    }



    public async Task<bool> FileExistsAsync(int fileId, CancellationToken cancellationToken = default)
    {
        var fileDocument = await _fileDocumentRepository.GetByIdAsync(fileId, cancellationToken);
        if (fileDocument == null)
        {
            return false;
        }

        return _fileStorageService.FileExists(fileDocument.FilePath);
    }

    #endregion
}