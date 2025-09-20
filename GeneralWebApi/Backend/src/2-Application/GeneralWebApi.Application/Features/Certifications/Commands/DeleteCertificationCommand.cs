using GeneralWebApi.DTOs.Certification;
using MediatR;

namespace GeneralWebApi.Application.Features.Certifications.Commands;

public class DeleteCertificationCommand : IRequest<CertificationDto>
{
    public int Id { get; set; }
}

