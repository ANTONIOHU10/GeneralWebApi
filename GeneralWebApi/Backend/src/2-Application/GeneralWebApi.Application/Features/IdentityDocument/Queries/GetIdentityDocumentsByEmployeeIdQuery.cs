using GeneralWebApi.DTOs.IdentityDocument;
using MediatR;

namespace GeneralWebApi.Application.Features.IdentityDocument.Queries;

public class GetIdentityDocumentsByEmployeeIdQuery : IRequest<IEnumerable<IdentityDocumentListDto>>
{
    public int EmployeeId { get; set; }
}

