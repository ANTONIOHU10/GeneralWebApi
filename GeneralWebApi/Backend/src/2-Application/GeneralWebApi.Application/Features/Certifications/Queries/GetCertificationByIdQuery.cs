using GeneralWebApi.DTOs.Certification;
using MediatR;

namespace GeneralWebApi.Application.Features.Certifications.Queries;

public class GetCertificationByIdQuery : IRequest<CertificationDto>
{
    public int Id { get; set; }
}





