using GeneralWebApi.Domain.Entities.Base;

namespace GeneralWebApi.Domain.Entities;

public class FileDocument : BaseEntity
{
    public string FileName { get; set; } = string.Empty;
    public byte[] Content { get; set; } = Array.Empty<byte>();
    public string FileExtension { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string FileContentType { get; set; } = string.Empty;
}
