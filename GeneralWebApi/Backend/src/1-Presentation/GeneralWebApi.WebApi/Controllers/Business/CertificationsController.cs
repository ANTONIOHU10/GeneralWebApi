using GeneralWebApi.Application.Features.Certifications.Commands;
using GeneralWebApi.Application.Features.Certifications.Queries;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Controllers.Base;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Certification;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.Controllers.Business;

public class CertificationsController : BaseController
{
    private readonly IMediator _mediator;

    public CertificationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<CertificationListDto>>>> GetCertifications([FromQuery] CertificationSearchDto searchDto)
    {
        return await ValidateAndExecuteAsync(searchDto, async (validatedDto) =>
        {
            var query = new GetCertificationsQuery { CertificationSearchDto = validatedDto };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<PagedResult<CertificationListDto>>.SuccessResult(result, "Certifications retrieved successfully"));
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<CertificationDto>>> GetCertification(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var query = new GetCertificationByIdQuery { Id = validatedId };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<CertificationDto>.SuccessResult(result, "Certification retrieved successfully"));
        });
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<CertificationDto>>> CreateCertification([FromBody] CreateCertificationDto createDto)
    {
        return await ValidateAndExecuteAsync(createDto, async (validatedDto) =>
        {
            var command = new CreateCertificationCommand { CreateCertificationDto = validatedDto };
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetCertification), new { id = result.Id },
                ApiResponse<CertificationDto>.SuccessResult(result, "Certification created successfully"));
        });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<CertificationDto>>> UpdateCertification([FromBody] UpdateCertificationDto updateDto)
    {
        return await ValidateAndExecuteAsync(updateDto, async (validatedDto) =>
        {
            var command = new UpdateCertificationCommand { UpdateCertificationDto = validatedDto };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<CertificationDto>.SuccessResult(result, "Certification updated successfully"));
        });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<CertificationDto>>> DeleteCertification(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var command = new DeleteCertificationCommand { Id = validatedId };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<CertificationDto>.SuccessResult(result, "Certification deleted successfully"));
        });
    }

    [HttpGet("employee/{employeeId}")]
    public async Task<ActionResult<ApiResponse<List<CertificationDto>>>> GetCertificationsByEmployee(int employeeId)
    {
        return await ValidateAndExecuteAsync(employeeId, async (validatedId) =>
        {
            var query = new GetCertificationsByEmployeeQuery { EmployeeId = validatedId };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<List<CertificationDto>>.SuccessResult(result, "Employee certifications retrieved successfully"));
        });
    }

    [HttpGet("expiring")]
    public async Task<ActionResult<ApiResponse<List<CertificationDto>>>> GetExpiringCertifications([FromQuery] DateTime expiryDate)
    {
        var query = new GetExpiringCertificationsQuery { ExpiryDate = expiryDate };
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<List<CertificationDto>>.SuccessResult(result, "Expiring certifications retrieved successfully"));
    }
}

