using GeneralWebApi.Application.Features.Certifications.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Certification;
using MediatR;

namespace GeneralWebApi.Application.Features.Certifications.Handlers;

public class GetCertificationByIdQueryHandler : IRequestHandler<GetCertificationByIdQuery, CertificationDto>
{
    private readonly ICertificationService _certificationService;

    public GetCertificationByIdQueryHandler(ICertificationService certificationService)
    {
        _certificationService = certificationService;
    }

    public async Task<CertificationDto> Handle(GetCertificationByIdQuery request, CancellationToken cancellationToken)
    {
        return await _certificationService.GetByIdAsync(request.Id, cancellationToken);
    }
}



