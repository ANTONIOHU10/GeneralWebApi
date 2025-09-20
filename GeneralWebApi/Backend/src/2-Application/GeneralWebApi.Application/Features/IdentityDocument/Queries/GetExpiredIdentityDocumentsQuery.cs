using GeneralWebApi.DTOs.IdentityDocument;
using MediatR;

namespace GeneralWebApi.Application.Features.IdentityDocument.Queries;

public class GetExpiredIdentityDocumentsQuery : IRequest<IEnumerable<IdentityDocumentListDto>>
{
}



