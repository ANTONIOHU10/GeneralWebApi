using GeneralWebApi.Application.Features.IdentityDocument.Queries;
using GeneralWebApi.Application.Interfaces;
using GeneralWebApi.DTOs.IdentityDocument;
using MediatR;

namespace GeneralWebApi.Application.Features.IdentityDocument.Handlers;

public class GetExpiredIdentityDocumentsQueryHandler : IRequestHandler<GetExpiredIdentityDocumentsQuery, IEnumerable<IdentityDocumentListDto>>
{
    private readonly IIdentityDocumentService _identityDocumentService;

    public GetExpiredIdentityDocumentsQueryHandler(IIdentityDocumentService identityDocumentService)
    {
        _identityDocumentService = identityDocumentService;
    }

    public async Task<IEnumerable<IdentityDocumentListDto>> Handle(GetExpiredIdentityDocumentsQuery request, CancellationToken cancellationToken)
    {
        return await _identityDocumentService.GetExpiredDocumentsAsync(cancellationToken);
    }
}

