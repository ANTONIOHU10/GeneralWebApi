using GeneralWebApi.DTOs.Certification;
using MediatR;

namespace GeneralWebApi.Application.Features.Certifications.Commands;

public class UpdateCertificationCommand : IRequest<CertificationDto>
{
    public UpdateCertificationDto UpdateCertificationDto { get; set; } = null!;
}





