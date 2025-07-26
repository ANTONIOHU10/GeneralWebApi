using GeneralWebApi.Domain.Entities.Base;

namespace GeneralWebApi.Domain.Entities;

public class FileDocument : BaseEntity
{
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string FileExtension { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string FileContentType { get; set; } = string.Empty;
    public string FileCategory { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string FileHash { get; set; } = string.Empty;
}
