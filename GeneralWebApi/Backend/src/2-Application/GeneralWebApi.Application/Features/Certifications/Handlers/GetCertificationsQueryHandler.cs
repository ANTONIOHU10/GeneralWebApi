using GeneralWebApi.Application.Features.Certifications.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Certification;
using MediatR;

namespace GeneralWebApi.Application.Features.Certifications.Handlers;

public class GetCertificationsQueryHandler : IRequestHandler<GetCertificationsQuery, PagedResult<CertificationListDto>>
{
    private readonly ICertificationService _certificationService;

    public GetCertificationsQueryHandler(ICertificationService certificationService)
    {
        _certificationService = certificationService;
    }

    public async Task<PagedResult<CertificationListDto>> Handle(GetCertificationsQuery request, CancellationToken cancellationToken)
    {
        return await _certificationService.GetPagedAsync(request.CertificationSearchDto, cancellationToken);
    }
}

