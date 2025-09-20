using GeneralWebApi.Application.Features.IdentityDocument.Queries;
using GeneralWebApi.Application.Interfaces;
using GeneralWebApi.DTOs.IdentityDocument;
using MediatR;

namespace GeneralWebApi.Application.Features.IdentityDocument.Handlers;

public class GetExpiringIdentityDocumentsQueryHandler : IRequestHandler<GetExpiringIdentityDocumentsQuery, IEnumerable<IdentityDocumentListDto>>
{
    private readonly IIdentityDocumentService _identityDocumentService;

    public GetExpiringIdentityDocumentsQueryHandler(IIdentityDocumentService identityDocumentService)
    {
        _identityDocumentService = identityDocumentService;
    }

    public async Task<IEnumerable<IdentityDocumentListDto>> Handle(GetExpiringIdentityDocumentsQuery request, CancellationToken cancellationToken)
    {
        return await _identityDocumentService.GetExpiringDocumentsAsync(request.DaysFromNow, cancellationToken);
    }
}



