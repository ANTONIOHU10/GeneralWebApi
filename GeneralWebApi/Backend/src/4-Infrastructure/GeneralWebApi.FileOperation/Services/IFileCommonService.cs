using GeneralWebApi.Domain.Entities;

namespace GeneralWebApi.FileOperation.Services;

public interface IFileCommonService
{
    #region Read Operations

    /// <summary>
    /// Get file by ID
    /// </summary>
    Task<FileDocument> GetFileByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get file by file name
    /// </summary>
    Task<FileDocument> GetFileByFileNameAsync(string fileName, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all files
    /// </summary>
    Task<IEnumerable<FileDocument>> GetAllFilesAsync(CancellationToken cancellationToken = default);



    /// <summary>
    /// Get file stream for download
    /// </summary>
    Task<Stream> GetFileStreamAsync(int fileId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get file stream by file name for download
    /// </summary>
    Task<Stream> GetFileStreamByFileNameAsync(string fileName, CancellationToken cancellationToken = default);

    #endregion

    #region Write Operations

    #endregion

    #region Delete Operations

    /// <summary>
    /// Delete file by file name (both database record and local file)
    /// </summary>
    Task<FileDocument> DeleteFileByFileNameAsync(string fileName, CancellationToken cancellationToken = default);

    /// <summary>
    /// Delete file by ID (both database record and local file)
    /// </summary>
    Task<FileDocument> DeleteFileByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Delete all files (use with caution)
    /// </summary>
    Task<IEnumerable<FileDocument>> DeleteAllFilesAsync(CancellationToken cancellationToken = default);

    #endregion

    #region Utility Operations

    /// <summary>
    /// Get file count
    /// </summary>
    Task<int> GetFileCountAsync(CancellationToken cancellationToken = default);



    /// <summary>
    /// Check if file exists in local file system
    /// </summary>
    Task<bool> FileExistsAsync(int fileId, CancellationToken cancellationToken = default);

    #endregion
}