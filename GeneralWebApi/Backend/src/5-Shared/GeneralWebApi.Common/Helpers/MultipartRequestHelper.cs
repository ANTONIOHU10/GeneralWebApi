using Microsoft.Net.Http.Headers;
namespace GeneralWebApi.Common.Helpers;

// example of the document

// POST /api/upload HTTP/1.1
// Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

// ------WebKitFormBoundary7MA4YWxkTrZu0gW
// Content-Disposition: form-data; name="file"; filename="cat.jpg"
// Content-Type: image/jpeg

// (binary file content)
// ------WebKitFormBoundary7MA4YWxkTrZu0gW--


public static class MultipartRequestHelper
{
    public static string GetBoundary(MediaTypeHeaderValue contentType, int lengthLimit)
    {
        // its necessary to remove the quotes, otherwise, the boundary will be invalid
        // for example, boundary = "----WebKitFormBoundary1234567890"
        // after removing the quotes, it will be ----WebKitFormBoundary1234567890
        var boundary = HeaderUtilities.RemoveQuotes(contentType.Boundary).Value;
        if (string.IsNullOrWhiteSpace(boundary) || boundary.Length > lengthLimit)
            throw new InvalidDataException("Invalid boundary.");
        return boundary;
    }

    public static bool IsMultipartContentType(string contentType)
    {
        return !string.IsNullOrEmpty(contentType) &&
               contentType.Contains("multipart/", StringComparison.OrdinalIgnoreCase);
    }

    public static bool HasFileContentDisposition(ContentDispositionHeaderValue contentDisposition)
    {

        // verify the content disposition is a file
        return contentDisposition != null &&
               contentDisposition.DispositionType.Equals("form-data") &&
               !string.IsNullOrEmpty(contentDisposition.FileName.Value);
    }
}