using GeneralWebApi.DTOs.Certification;
using MediatR;

namespace GeneralWebApi.Application.Features.Certifications.Commands;

public class CreateCertificationCommand : IRequest<CertificationDto>
{
    public CreateCertificationDto CreateCertificationDto { get; set; } = null!;
}

