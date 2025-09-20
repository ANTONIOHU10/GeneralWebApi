using GeneralWebApi.Application.Features.Certifications.Commands;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Certification;
using MediatR;

namespace GeneralWebApi.Application.Features.Certifications.Handlers;

public class UpdateCertificationCommandHandler : IRequestHandler<UpdateCertificationCommand, CertificationDto>
{
    private readonly ICertificationService _certificationService;

    public UpdateCertificationCommandHandler(ICertificationService certificationService)
    {
        _certificationService = certificationService;
    }

    public async Task<CertificationDto> Handle(UpdateCertificationCommand request, CancellationToken cancellationToken)
    {
        return await _certificationService.UpdateAsync(request.UpdateCertificationDto.Id, request.UpdateCertificationDto, cancellationToken);
    }
}



