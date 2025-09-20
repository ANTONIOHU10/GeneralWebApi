using GeneralWebApi.DTOs.IdentityDocument;
using MediatR;

namespace GeneralWebApi.Application.Features.IdentityDocument.Queries;

public class GetExpiringIdentityDocumentsQuery : IRequest<IEnumerable<IdentityDocumentListDto>>
{
    public int DaysFromNow { get; set; } = 30;
}





