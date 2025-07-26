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

    Task<IEnumerable<FileDocument>> GetAllFilesAsync(CancellationToken cancellationToken = default);

    #endregion

    #region Write Operations

    /// <summary>
    /// Update file metadata (not content)
    /// </summary>
    Task<FileDocument> UpdateFileMetadataAsync(FileDocument fileDocument, CancellationToken cancellationToken = default);

    /// <summary>
    /// Update file content
    /// </summary>
    Task<FileDocument> UpdateFileContentAsync(string fileName, byte[] newContent, CancellationToken cancellationToken = default);

    #endregion

    #region Delete Operations

    /// <summary>
    /// Delete file by file name
    /// </summary>
    Task<FileDocument> DeleteFileByFileNameAsync(string fileName, CancellationToken cancellationToken = default);

    /// <summary>
    /// Delete file by ID
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

    #endregion
}