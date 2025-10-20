using GeneralWebApi.Application.Features.Certifications.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Certification;
using MediatR;

namespace GeneralWebApi.Application.Features.Certifications.Handlers;

public class GetCertificationsByEmployeeQueryHandler : IRequestHandler<GetCertificationsByEmployeeQuery, List<CertificationDto>>
{
    private readonly ICertificationService _certificationService;

    public GetCertificationsByEmployeeQueryHandler(ICertificationService certificationService)
    {
        _certificationService = certificationService;
    }

    public async Task<List<CertificationDto>> Handle(GetCertificationsByEmployeeQuery request, CancellationToken cancellationToken)
    {
        return await _certificationService.GetByEmployeeIdAsync(request.EmployeeId, cancellationToken);
    }
}





