using Microsoft.Net.Http.Headers;

namespace GeneralWebApi.Common.Helpers;

public interface IMultipartRequestHelper
{
    string GetBoundary(MediaTypeHeaderValue contentType, int lengthLimit);
    bool IsMultipartContentType(string contentType);
    bool HasFileContentDisposition(ContentDispositionHeaderValue contentDisposition);
}