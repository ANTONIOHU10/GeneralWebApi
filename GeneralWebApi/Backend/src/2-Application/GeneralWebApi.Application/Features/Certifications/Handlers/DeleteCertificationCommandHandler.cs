using GeneralWebApi.Application.Features.Certifications.Commands;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Certification;
using MediatR;

namespace GeneralWebApi.Application.Features.Certifications.Handlers;

public class DeleteCertificationCommandHandler : IRequestHandler<DeleteCertificationCommand, CertificationDto>
{
    private readonly ICertificationService _certificationService;

    public DeleteCertificationCommandHandler(ICertificationService certificationService)
    {
        _certificationService = certificationService;
    }

    public async Task<CertificationDto> Handle(DeleteCertificationCommand request, CancellationToken cancellationToken)
    {
        return await _certificationService.DeleteAsync(request.Id, cancellationToken);
    }
}





