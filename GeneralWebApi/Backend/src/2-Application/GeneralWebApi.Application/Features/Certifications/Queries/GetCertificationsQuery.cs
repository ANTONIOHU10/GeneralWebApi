using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Certification;
using MediatR;

namespace GeneralWebApi.Application.Features.Certifications.Queries;

public class GetCertificationsQuery : IRequest<PagedResult<CertificationListDto>>
{
    public CertificationSearchDto CertificationSearchDto { get; set; } = null!;
}



