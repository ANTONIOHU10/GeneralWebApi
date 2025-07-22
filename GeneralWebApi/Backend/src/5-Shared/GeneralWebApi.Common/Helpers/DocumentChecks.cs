using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace GeneralWebApi.Common.Helpers;

public class DocumentChecks : IDocumentChecks
{
    private static string[]? _permittedExtensions;
    private static long _maxFileSize;
    private readonly ILogger _logger;

    private static readonly Dictionary<string, List<byte[]>> _fileSignature =
        new Dictionary<string, List<byte[]>>
    {
        { ".jpeg", new List<byte[]>
            {
                new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 },
                new byte[] { 0xFF, 0xD8, 0xFF, 0xE2 },
                new byte[] { 0xFF, 0xD8, 0xFF, 0xE3 },
            }
        },
        { ".jpg", new List<byte[]>
            {
                new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 },
                new byte[] { 0xFF, 0xD8, 0xFF, 0xE2 },
                new byte[] { 0xFF, 0xD8, 0xFF, 0xE3 },
            }
        },
        { ".png", new List<byte[]>
            {
                new byte[] { 0x89, 0x50, 0x4E, 0x47 },
            }
        },
        { ".pdf", new List<byte[]>
            {
                //new byte[] { 0x25, 0x50, 0x44, 0x46, 0x2D },
                System.Text.Encoding.UTF8.GetBytes("%PDF-"),
            }
        },


    };
    public DocumentChecks(IConfiguration configuration, ILogger<DocumentChecks> logger)
    {
        _maxFileSize = configuration.GetSection("DocumentCheck:MaxFileSize").Get<long>();
        _permittedExtensions = configuration.GetSection("DocumentCheck:PermittedExtensions").Get<string[]>();
        _logger = logger;
    }

    public bool IsValidExtension(string uploadedFileName)
    {
        var ext = Path.GetExtension(uploadedFileName).ToLowerInvariant();

        if (string.IsNullOrEmpty(ext) || _permittedExtensions == null || !_permittedExtensions.Contains(ext))
        {
            // The extension is invalid ... discontinue processing the file
            _logger.LogWarning("Invalid file extension: {Extension}", ext);
            return false;
        }
        _logger.LogInformation("File extension is valid: {Extension}", ext);
        return true;
    }

    public bool IsValidSize(long fileSize)
    {
        if (fileSize > _maxFileSize)
        {
            _logger.LogWarning("File size is too large: {FileSize}", fileSize);
            return false;
        }
        _logger.LogInformation("File size is valid: {FileSize}", fileSize);
        return true;
    }

    public bool IsValidTypeSignature(Stream fileStream, string extension)
    {
        var ext = extension.ToLowerInvariant();

        if (!_fileSignature.TryGetValue(ext, out List<byte[]>? signatures))
        {
            _logger.LogWarning("No signature found for extension: {Extension}", ext);
            return false;
        }

        var maxSignatureLength = signatures.Max(m => m.Length);

        // check if the file is too small to validate the signature
        if (fileStream.Length < maxSignatureLength)
        {
            _logger.LogWarning("File too small to validate signature");
            return false;
        }

        using var reader = new BinaryReader(fileStream);
        var fileBytes = reader.ReadBytes((int)fileStream.Length);
        _logger.LogInformation("File type signature certificate: {FileBytes}", fileBytes);
        return signatures.Any(signature =>
            fileBytes.Take(signature.Length).SequenceEqual(signature));
    }
}