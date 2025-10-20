using GeneralWebApi.DTOs.IdentityDocument;
using MediatR;

namespace GeneralWebApi.Application.Features.IdentityDocument.Commands;

public class UpdateIdentityDocumentCommand : IRequest<IdentityDocumentDto>
{
    public UpdateIdentityDocumentDto UpdateIdentityDocumentDto { get; set; } = null!;
}





