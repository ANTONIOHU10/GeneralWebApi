using GeneralWebApi.DTOs.IdentityDocument;
using MediatR;

namespace GeneralWebApi.Application.Features.IdentityDocument.Commands;

public class CreateIdentityDocumentCommand : IRequest<IdentityDocumentDto>
{
    public CreateIdentityDocumentDto CreateIdentityDocumentDto { get; set; } = null!;
}





