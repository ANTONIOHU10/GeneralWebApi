using GeneralWebApi.DTOs.IdentityDocument;
using GeneralWebApi.Domain.Entities;
using MediatR;

namespace GeneralWebApi.Application.Features.IdentityDocument.Queries;

public class GetIdentityDocumentsQuery : IRequest<PagedResult<IdentityDocumentListDto>>
{
    public IdentityDocumentSearchDto IdentityDocumentSearchDto { get; set; } = null!;
}

