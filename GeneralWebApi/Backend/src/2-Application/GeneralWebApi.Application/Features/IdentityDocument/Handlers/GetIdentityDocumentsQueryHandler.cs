using GeneralWebApi.Application.Features.IdentityDocument.Queries;
using GeneralWebApi.Application.Interfaces;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.IdentityDocument;
using MediatR;

namespace GeneralWebApi.Application.Features.IdentityDocument.Handlers;

public class GetIdentityDocumentsQueryHandler : IRequestHandler<GetIdentityDocumentsQuery, PagedResult<IdentityDocumentListDto>>
{
    private readonly IIdentityDocumentService _identityDocumentService;

    public GetIdentityDocumentsQueryHandler(IIdentityDocumentService identityDocumentService)
    {
        _identityDocumentService = identityDocumentService;
    }

    public async Task<PagedResult<IdentityDocumentListDto>> Handle(GetIdentityDocumentsQuery request, CancellationToken cancellationToken)
    {
        return await _identityDocumentService.GetPagedAsync(request.IdentityDocumentSearchDto, cancellationToken);
    }
}





