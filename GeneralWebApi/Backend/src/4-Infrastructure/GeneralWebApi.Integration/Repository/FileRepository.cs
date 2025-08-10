using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Integration.Context;
using GeneralWebApi.Integration.Repository.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

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
                _logger.LogWarning("FileDocument with fileName {FileName} not found", fileName);
                throw new KeyNotFoundException($"FileDocument with fileName {fileName} not found");
            }

            return fileDocument;
        }
        catch (Exception ex) when (ex is not KeyNotFoundException)
        {
            _logger.LogError(ex, "Failed to get FileDocument with fileName {FileName}", fileName);
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

            _logger.LogDebug("Retrieved {Count} FileDocuments", fileDocuments.Count);
            return fileDocuments;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get all FileDocuments");
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
            _logger.LogError(ex, "Failed to add FileDocument with fileName {FileName}", fileDocument.FileName);
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
            _logger.LogError(ex, "Failed to update FileDocument with ID {Id}", fileDocument.Id);
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
            _logger.LogError(ex, "Failed to delete FileDocument with fileName {FileName}", fileName);
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
            _logger.LogError(ex, "Failed to delete all FileDocuments");
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