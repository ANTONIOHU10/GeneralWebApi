using GeneralWebApi.DTOs.Certification;
using MediatR;

namespace GeneralWebApi.Application.Features.Certifications.Queries;

public class GetExpiringCertificationsQuery : IRequest<List<CertificationDto>>
{
    public DateTime ExpiryDate { get; set; }
}

