using GeneralWebApi.DTOs.Certification;
using MediatR;

namespace GeneralWebApi.Application.Features.Certifications.Queries;

public class GetCertificationsByEmployeeQuery : IRequest<List<CertificationDto>>
{
    public int EmployeeId { get; set; }
}





