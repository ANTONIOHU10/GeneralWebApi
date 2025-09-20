using GeneralWebApi.DTOs.IdentityDocument;
using MediatR;

namespace GeneralWebApi.Application.Features.IdentityDocument.Queries;

public class GetIdentityDocumentByIdQuery : IRequest<IdentityDocumentDto>
{
    public int Id { get; set; }
}

