using GeneralWebApi.Application.Features.Certifications.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Certification;
using MediatR;

namespace GeneralWebApi.Application.Features.Certifications.Handlers;

public class GetExpiringCertificationsQueryHandler : IRequestHandler<GetExpiringCertificationsQuery, List<CertificationDto>>
{
    private readonly ICertificationService _certificationService;

    public GetExpiringCertificationsQueryHandler(ICertificationService certificationService)
    {
        _certificationService = certificationService;
    }

    public async Task<List<CertificationDto>> Handle(GetExpiringCertificationsQuery request, CancellationToken cancellationToken)
    {
        return await _certificationService.GetExpiringCertificationsAsync(request.ExpiryDate, cancellationToken);
    }
}



