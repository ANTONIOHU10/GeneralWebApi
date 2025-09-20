using GeneralWebApi.DTOs.IdentityDocument;
using MediatR;

namespace GeneralWebApi.Application.Features.IdentityDocument.Commands;

public class DeleteIdentityDocumentCommand : IRequest<IdentityDocumentDto>
{
    public int Id { get; set; }
}



