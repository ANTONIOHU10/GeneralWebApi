using GeneralWebApi.Application.Features.IdentityDocument.Commands;
using GeneralWebApi.Application.Interfaces;
using GeneralWebApi.DTOs.IdentityDocument;
using MediatR;

namespace GeneralWebApi.Application.Features.IdentityDocument.Handlers;

public class DeleteIdentityDocumentCommandHandler : IRequestHandler<DeleteIdentityDocumentCommand, IdentityDocumentDto>
{
    private readonly IIdentityDocumentService _identityDocumentService;

    public DeleteIdentityDocumentCommandHandler(IIdentityDocumentService identityDocumentService)
    {
        _identityDocumentService = identityDocumentService;
    }

    public async Task<IdentityDocumentDto> Handle(DeleteIdentityDocumentCommand request, CancellationToken cancellationToken)
    {
        return await _identityDocumentService.DeleteAsync(request.Id, cancellationToken);
    }
}

