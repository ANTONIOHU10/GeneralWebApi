using GeneralWebApi.Application.Features.IdentityDocument.Commands;
using GeneralWebApi.Application.Interfaces;
using GeneralWebApi.DTOs.IdentityDocument;
using MediatR;

namespace GeneralWebApi.Application.Features.IdentityDocument.Handlers;

public class UpdateIdentityDocumentCommandHandler : IRequestHandler<UpdateIdentityDocumentCommand, IdentityDocumentDto>
{
    private readonly IIdentityDocumentService _identityDocumentService;

    public UpdateIdentityDocumentCommandHandler(IIdentityDocumentService identityDocumentService)
    {
        _identityDocumentService = identityDocumentService;
    }

    public async Task<IdentityDocumentDto> Handle(UpdateIdentityDocumentCommand request, CancellationToken cancellationToken)
    {
        return await _identityDocumentService.UpdateAsync(request.UpdateIdentityDocumentDto, cancellationToken);
    }
}



