using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using GeneralWebApi.Logging.Templates;
using System.Linq;

namespace GeneralWebApi.Common.Helpers;

public class DocumentChecks : IDocumentChecks
{
    private static string[]? _permittedExtensions;
    private static long _maxFileSize;
    private readonly ILogger _logger;

    // TODO: add more file signature and understand if its necessary
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
            _logger.LogWarning(LogTemplates.DocumentValidation.InvalidFileExtension, ext);
            return false;
        }
        _logger.LogInformation(LogTemplates.DocumentValidation.ValidFileExtension, ext);
        return true;
    }

    public bool IsValidSize(long fileSize)
    {
        if (fileSize > _maxFileSize)
        {
            _logger.LogWarning(LogTemplates.DocumentValidation.FileSizeTooLarge, fileSize);
            return false;
        }
        _logger.LogInformation(LogTemplates.DocumentValidation.ValidFileSize, fileSize);
        return true;
    }

    public bool IsValidTypeSignature(Stream fileStream, string extension)
    {
        var ext = extension.ToLowerInvariant();

        if (!_fileSignature.TryGetValue(ext, out List<byte[]>? signatures))
        {
            _logger.LogWarning(LogTemplates.DocumentValidation.NoSignatureFound, ext);
            return false;
        }

        // get the max signature length, for example, .pdf has 5 bytes, .jpg has 4 bytes
        var maxSignatureLength = signatures.Max(m => m.Length);

        // read the HEADER of the file, to validate the signature
        var headerBytes = new byte[maxSignatureLength];
        var bytesRead = fileStream.Read(headerBytes, 0, maxSignatureLength);
        // check if the file is too small to validate the signature
        if (bytesRead < maxSignatureLength)
        {
            _logger.LogWarning(LogTemplates.DocumentValidation.FileTooSmall);
            return false;
        }

        _logger.LogInformation(LogTemplates.DocumentValidation.FileSignatureCertificate, headerBytes);
        return signatures.Any(signature =>
            headerBytes.Take(signature.Length).SequenceEqual(signature));
    }
}