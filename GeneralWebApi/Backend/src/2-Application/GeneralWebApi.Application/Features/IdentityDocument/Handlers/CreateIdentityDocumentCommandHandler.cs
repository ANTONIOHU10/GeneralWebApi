using GeneralWebApi.Application.Features.IdentityDocument.Commands;
using GeneralWebApi.Application.Interfaces;
using GeneralWebApi.DTOs.IdentityDocument;
using MediatR;

namespace GeneralWebApi.Application.Features.IdentityDocument.Handlers;

public class CreateIdentityDocumentCommandHandler : IRequestHandler<CreateIdentityDocumentCommand, IdentityDocumentDto>
{
    private readonly IIdentityDocumentService _identityDocumentService;

    public CreateIdentityDocumentCommandHandler(IIdentityDocumentService identityDocumentService)
    {
        _identityDocumentService = identityDocumentService;
    }

    public async Task<IdentityDocumentDto> Handle(CreateIdentityDocumentCommand request, CancellationToken cancellationToken)
    {
        return await _identityDocumentService.CreateAsync(request.CreateIdentityDocumentDto, cancellationToken);
    }
}



