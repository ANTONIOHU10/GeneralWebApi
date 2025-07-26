using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Integration.Context;
using Microsoft.EntityFrameworkCore;

namespace GeneralWebApi.Integration.Repository;

public class FileRepository : IFileDocumentRepository
{
    private readonly ApplicationDbContext _dbContext;

    public FileRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    #region IBaseRepository Implementation

    public async Task<FileDocument> AddAsync(FileDocument entity, CancellationToken cancellationToken = default)
    {
        await _dbContext.FileDocuments.AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<IEnumerable<FileDocument>> AddRangeAsync(IEnumerable<FileDocument> entities, CancellationToken cancellationToken = default)
    {
        await _dbContext.FileDocuments.AddRangeAsync(entities, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entities;
    }

    public async Task<FileDocument> GetByIdAsync(object id, CancellationToken cancellationToken = default)
    {
        if (id is int intId)
        {
            return await _dbContext.FileDocuments.FindAsync(new object[] { intId }, cancellationToken) ?? throw new Exception("File not found");
        }

        throw new ArgumentException("Invalid id type. Expected int.", nameof(id));
    }

    public async Task<IEnumerable<FileDocument>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.FileDocuments
            .Select(f => new FileDocument
            {
                Id = f.Id,
                FileName = f.FileName,
                FileExtension = f.FileExtension,
                FileSize = f.FileSize,
                FileContentType = f.FileContentType,
                CreatedAt = f.CreatedAt,
                UpdatedAt = f.UpdatedAt,
                IsActive = f.IsActive,
                IsDeleted = f.IsDeleted,
                Version = f.Version,
                // Exclude Content field to avoid loading large binary data
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<FileDocument> UpdateAsync(FileDocument entity, CancellationToken cancellationToken = default)
    {
        _dbContext.FileDocuments.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<IEnumerable<FileDocument>> UpdateRangeAsync(IEnumerable<FileDocument> entities, CancellationToken cancellationToken = default)
    {
        _dbContext.FileDocuments.UpdateRange(entities);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entities;
    }

    public async Task<FileDocument> DeleteAsync(object id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken) ?? throw new Exception("File not found");
        {
            _dbContext.FileDocuments.Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        return entity;
    }

    public async Task<IEnumerable<FileDocument>> DeleteRangeAsync(IEnumerable<FileDocument> entities, CancellationToken cancellationToken = default)
    {
        _dbContext.FileDocuments.RemoveRange(entities);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entities;
    }

    #endregion

    #region IFileDocumentRepository Implementation

    public async Task<FileDocument> GetByFileNameAsync(string fileName, CancellationToken cancellationToken = default)
    {
        var fileDocument = await _dbContext.FileDocuments
            .FirstOrDefaultAsync(f => f.FileName == fileName, cancellationToken);

        if (fileDocument == null)
        {
            throw new Exception("File not found");
        }

        return fileDocument;
    }

    public async Task<List<FileDocument>> GetAllFileDocumentsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.FileDocuments
            .Select(f => new FileDocument
            {
                Id = f.Id,
                FileName = f.FileName,
                FileExtension = f.FileExtension,
                FileSize = f.FileSize,
                FileContentType = f.FileContentType,
                CreatedAt = f.CreatedAt,
                UpdatedAt = f.UpdatedAt,
                IsActive = f.IsActive,
                IsDeleted = f.IsDeleted,
                Version = f.Version,
                // Exclude Content field to avoid loading large binary data
            })
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<FileDocument> AddFileDocumentAsync(FileDocument fileDocument, CancellationToken cancellationToken = default)
    {
        // Set creation timestamp
        fileDocument.CreatedAt = DateTime.UtcNow;
        fileDocument.UpdatedAt = DateTime.UtcNow;

        await _dbContext.FileDocuments.AddAsync(fileDocument, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return fileDocument;
    }

    public async Task<FileDocument> UpdateFileDocumentAsync(FileDocument fileDocument, CancellationToken cancellationToken = default)
    {
        // Set update timestamp
        fileDocument.UpdatedAt = DateTime.UtcNow;

        _dbContext.FileDocuments.Update(fileDocument);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return fileDocument;
    }

    public async Task<FileDocument> DeleteFileDocumentAsync(string fileName, CancellationToken cancellationToken = default)
    {
        // Check if the file exists
        if (!await ExistsByFileNameAsync(fileName, cancellationToken))
        {
            throw new Exception("File not found");
        }

        var fileDocument = await GetByFileNameAsync(fileName, cancellationToken);
        _dbContext.FileDocuments.Remove(fileDocument);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return fileDocument;
    }

    public async Task<List<FileDocument>> DeleteAllFileDocumentsAsync(CancellationToken cancellationToken = default)
    {
        // Get files to delete (metadata only)
        var filesToDelete = await _dbContext.FileDocuments
            .Select(f => new FileDocument
            {
                Id = f.Id,
                FileName = f.FileName,
                FileExtension = f.FileExtension,
                FileSize = f.FileSize,
                FileContentType = f.FileContentType,
                CreatedAt = f.CreatedAt,
                UpdatedAt = f.UpdatedAt,
                IsActive = f.IsActive,
                IsDeleted = f.IsDeleted,
                Version = f.Version,
                // Exclude Content field to avoid loading large binary data
            })
            .ToListAsync(cancellationToken);

        // Execute SQL delete directly without loading binary content
        await _dbContext.Database.ExecuteSqlRawAsync("DELETE FROM FileDocuments", cancellationToken);

        return filesToDelete;
    }

    public async Task<bool> ExistsByFileNameAsync(string fileName, CancellationToken cancellationToken = default)
    {
        return await _dbContext.FileDocuments
            .AnyAsync(f => f.FileName == fileName, cancellationToken);
    }

    public async Task<FileDocument> AddFileDocumentWithContentAsync(string fileName, byte[] content, string fileExtension, string contentType, CancellationToken cancellationToken = default)
    {
        var fileDocument = new FileDocument
        {
            FileName = fileName,
            Content = content,
            FileExtension = fileExtension,
            FileContentType = contentType,
            FileSize = content.Length
        };

        return await AddFileDocumentAsync(fileDocument, cancellationToken);
    }

    public async Task<byte[]> GetFileContentAsync(string fileName, CancellationToken cancellationToken = default)
    {
        var fileDocument = await GetByFileNameAsync(fileName, cancellationToken);
        return fileDocument.Content;
    }

    public async Task<FileDocument> UpdateFileContentAsync(string fileName, byte[] newContent, CancellationToken cancellationToken = default)
    {
        var fileDocument = await GetByFileNameAsync(fileName, cancellationToken);
        fileDocument.Content = newContent;
        fileDocument.FileSize = newContent.Length;
        fileDocument.UpdatedAt = DateTime.UtcNow;

        _dbContext.FileDocuments.Update(fileDocument);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return fileDocument;
    }

    public async Task<int> CountAsync(CancellationToken cancellationToken = default)
    {
        // Query count directly without loading any data
        return await _dbContext.FileDocuments.CountAsync(cancellationToken);
    }

    #endregion
}