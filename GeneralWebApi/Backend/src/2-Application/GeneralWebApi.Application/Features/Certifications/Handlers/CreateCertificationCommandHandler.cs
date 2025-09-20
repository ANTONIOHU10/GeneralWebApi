using GeneralWebApi.Application.Features.Certifications.Commands;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Certification;
using MediatR;

namespace GeneralWebApi.Application.Features.Certifications.Handlers;

public class CreateCertificationCommandHandler : IRequestHandler<CreateCertificationCommand, CertificationDto>
{
    private readonly ICertificationService _certificationService;

    public CreateCertificationCommandHandler(ICertificationService certificationService)
    {
        _certificationService = certificationService;
    }

    public async Task<CertificationDto> Handle(CreateCertificationCommand request, CancellationToken cancellationToken)
    {
        return await _certificationService.CreateAsync(request.CreateCertificationDto, cancellationToken);
    }
}

