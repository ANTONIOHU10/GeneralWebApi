using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Integration.Context;
using GeneralWebApi.Integration.Repository.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using GeneralWebApi.Logging.Templates;

namespace GeneralWebApi.Integration.Repository;

public class FileRepository : BaseRepository<FileDocument>, IFileDocumentRepository
{
    public FileRepository(ApplicationDbContext context, ILogger<FileRepository> logger)
        : base(context, logger)
    {
    }

    #region FileDocument-specific business methods

    public async Task<FileDocument> GetByFileNameAsync(string fileName, CancellationToken cancellationToken = default)
    {
        try
        {
            var fileDocument = await _dbSet
                .Where(f => !f.IsDeleted && f.FileName == fileName)
                .FirstOrDefaultAsync(cancellationToken);

            if (fileDocument == null)
            {
                _logger.LogWarning(LogTemplates.Repository.FileNotFound, fileName);
                throw new KeyNotFoundException($"FileDocument with fileName {fileName} not found");
            }

            return fileDocument;
        }
        catch (Exception ex) when (ex is not KeyNotFoundException)
        {
            _logger.LogError(ex, LogTemplates.Repository.FileGetByFileNameFailed, fileName);
            throw;
        }
    }

    public async Task<List<FileDocument>> GetAllFileDocumentsAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var fileDocuments = await _dbSet
                .Where(f => !f.IsDeleted)
                .Select(f => new FileDocument
                {
                    Id = f.Id,
                    FileName = f.FileName,
                    FilePath = f.FilePath,
                    FileExtension = f.FileExtension,
                    FileSize = f.FileSize,
                    FileContentType = f.FileContentType,
                    FileCategory = f.FileCategory,
                    OriginalFileName = f.OriginalFileName,
                    FileHash = f.FileHash,
                    CreatedAt = f.CreatedAt,
                    UpdatedAt = f.UpdatedAt,
                    IsActive = f.IsActive,
                    IsDeleted = f.IsDeleted,
                    Version = f.Version
                })
                .ToListAsync(cancellationToken);

            _logger.LogDebug(LogTemplates.Repository.FilesRetrieved, fileDocuments.Count);
            return fileDocuments;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, LogTemplates.Repository.FilesGetAllFailed);
            throw;
        }
    }

    public async Task<FileDocument> AddFileDocumentAsync(FileDocument fileDocument, CancellationToken cancellationToken = default)
    {
        try
        {
            // Use base repository method for adding
            return await AddAsync(fileDocument, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, LogTemplates.Repository.FileAddFailed, fileDocument.FileName);
            throw;
        }
    }

    public async Task<FileDocument> UpdateFileDocumentAsync(FileDocument fileDocument, CancellationToken cancellationToken = default)
    {
        try
        {
            // Use base repository method for updating
            return await UpdateAsync(fileDocument, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, LogTemplates.Repository.FileUpdateFailed, fileDocument.Id);
            throw;
        }
    }

    public async Task<FileDocument> DeleteFileDocumentAsync(string fileName, CancellationToken cancellationToken = default)
    {
        try
        {
            var fileDocument = await GetByFileNameAsync(fileName, cancellationToken);

            // Use base repository method for soft delete
            return await DeleteAsync(fileDocument.Id, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, LogTemplates.Repository.FileDeleteFailed, fileName);
            throw;
        }
    }

    public async Task<List<FileDocument>> DeleteAllFileDocumentsAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var fileDocuments = await _dbSet
                .Where(f => !f.IsDeleted)
                .ToListAsync(cancellationToken);

            if (fileDocuments.Any())
            {
                // Use base repository method for soft delete range
                var deletedDocuments = await DeleteRangeAsync(fileDocuments, cancellationToken);
                return deletedDocuments.ToList();
            }

            return new List<FileDocument>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, LogTemplates.Repository.FilesDeleteAllFailed);
            throw;
        }
    }

    public async Task<bool> ExistsByFileNameAsync(string fileName, CancellationToken cancellationToken = default)
    {
        return await _dbSet.AnyAsync(f => !f.IsDeleted && f.FileName == fileName, cancellationToken);
    }

    public async Task<int> CountAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet.CountAsync(f => !f.IsDeleted, cancellationToken);
    }

    #endregion

    #region Override base methods if needed

    // Override GetAllAsync to only return non-deleted files
    public override async Task<IEnumerable<FileDocument>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await GetActiveEntities().ToListAsync(cancellationToken);
    }

    #endregion
}