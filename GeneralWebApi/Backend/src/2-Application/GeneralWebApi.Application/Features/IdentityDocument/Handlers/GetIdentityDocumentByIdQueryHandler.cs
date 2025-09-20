using GeneralWebApi.Application.Features.IdentityDocument.Queries;
using GeneralWebApi.Application.Interfaces;
using GeneralWebApi.DTOs.IdentityDocument;
using MediatR;

namespace GeneralWebApi.Application.Features.IdentityDocument.Handlers;

public class GetIdentityDocumentByIdQueryHandler : IRequestHandler<GetIdentityDocumentByIdQuery, IdentityDocumentDto>
{
    private readonly IIdentityDocumentService _identityDocumentService;

    public GetIdentityDocumentByIdQueryHandler(IIdentityDocumentService identityDocumentService)
    {
        _identityDocumentService = identityDocumentService;
    }

    public async Task<IdentityDocumentDto> Handle(GetIdentityDocumentByIdQuery request, CancellationToken cancellationToken)
    {
        return await _identityDocumentService.GetByIdAsync(request.Id, cancellationToken);
    }
}



