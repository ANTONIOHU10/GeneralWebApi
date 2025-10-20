using GeneralWebApi.Application.Features.IdentityDocument.Queries;
using GeneralWebApi.Application.Interfaces;
using GeneralWebApi.DTOs.IdentityDocument;
using MediatR;

namespace GeneralWebApi.Application.Features.IdentityDocument.Handlers;

public class GetIdentityDocumentsByEmployeeIdQueryHandler : IRequestHandler<GetIdentityDocumentsByEmployeeIdQuery, IEnumerable<IdentityDocumentListDto>>
{
    private readonly IIdentityDocumentService _identityDocumentService;

    public GetIdentityDocumentsByEmployeeIdQueryHandler(IIdentityDocumentService identityDocumentService)
    {
        _identityDocumentService = identityDocumentService;
    }

    public async Task<IEnumerable<IdentityDocumentListDto>> Handle(GetIdentityDocumentsByEmployeeIdQuery request, CancellationToken cancellationToken)
    {
        return await _identityDocumentService.GetByEmployeeIdAsync(request.EmployeeId, cancellationToken);
    }
}





