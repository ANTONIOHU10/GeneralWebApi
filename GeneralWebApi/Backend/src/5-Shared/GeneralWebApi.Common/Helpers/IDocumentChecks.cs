namespace GeneralWebApi.Common.Helpers;

public interface IDocumentChecks
{
    bool IsValidExtension(string uploadedFileName);
    bool IsValidSize(long fileSize);
    bool IsValidTypeSignature(Stream fileStream, string extension);
}